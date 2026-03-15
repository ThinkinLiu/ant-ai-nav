import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 需要导出的表列表
const EXPORT_TABLES = [
  { name: 'categories', order: 'id' },
  { name: 'tags', order: 'id' },
  { name: 'ai_tools', order: 'id' },
  { name: 'ai_tool_rankings', order: 'id' },
  { name: 'ai_news', order: 'id' },
  { name: 'ai_hall_of_fame', order: 'id' },
  { name: 'ai_timeline', order: 'id' },
  { name: 'friend_links', order: 'sort_order' },
  { name: 'site_settings', order: 'id' },
  { name: 'smtp_settings', order: 'id' },
  { name: 'seo_settings', order: 'id' },
  { name: 'tool_tags', order: 'tool_id' },
]

// 数据导出API - 管理员专用
export async function GET(request: NextRequest) {
  try {
    // 简单验证（实际项目中应该验证管理员权限）
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      )
    }

    const client = getSupabaseClient()
    const exportData: Record<string, any[]> = {}
    const summary: Record<string, number> = {}

    // 导出每个表的数据
    for (const table of EXPORT_TABLES) {
      const { data, error } = await client
        .from(table.name)
        .select('*')
        .order(table.order, { ascending: true })

      if (error) {
        console.error(`导出表 ${table.name} 失败:`, error)
        exportData[table.name] = []
        summary[table.name] = 0
      } else {
        exportData[table.name] = data || []
        summary[table.name] = data?.length || 0
      }
    }

    // 添加导出元信息
    const result = {
      _meta: {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        summary,
        totalRecords: Object.values(summary).reduce((a, b) => a + b, 0),
      },
      data: exportData,
    }

    // 返回JSON文件下载
    return new NextResponse(JSON.stringify(result, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="ai-nav-backup-${new Date().toISOString().split('T')[0]}.json"`,
      },
    })
  } catch (error) {
    console.error('数据导出错误:', error)
    return NextResponse.json(
      { success: false, error: '导出失败，请稍后重试' },
      { status: 500 }
    )
  }
}
