import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 表定义：包含表名、排序字段、分类、描述
const TABLE_DEFINITIONS = [
  // 内容数据
  { name: 'ai_tools', order: 'id', category: 'content', label: 'AI工具库', description: '工具基本信息' },
  { name: 'ai_news', order: 'id', category: 'content', label: 'AI资讯', description: '资讯文章' },
  { name: 'ai_hall_of_fame', order: 'id', category: 'content', label: 'AI名人堂', description: '人物信息' },
  { name: 'ai_timeline', order: 'id', category: 'content', label: 'AI大事纪', description: '历史事件' },
  
  // 分类标签
  { name: 'categories', order: 'id', category: 'taxonomy', label: '工具分类', description: '工具分类目录' },
  { name: 'tags', order: 'id', category: 'taxonomy', label: '标签', description: '标签列表' },
  { name: 'tool_tags', order: 'tool_id', category: 'taxonomy', label: '工具标签关联', description: '工具与标签的关联' },
  
  // 排名数据
  { name: 'ai_tool_rankings', order: 'id', category: 'ranking', label: '工具排名', description: '工具排名数据' },
  { name: 'ranking_update_log', order: 'id', category: 'ranking', label: '排名更新日志', description: '排名更新记录' },
  { name: 'traffic_data_sources', order: 'id', category: 'ranking', label: '流量数据源', description: '排行榜配置' },
  
  // 互动数据
  { name: 'comments', order: 'id', category: 'interaction', label: '评论', description: '用户评论' },
  { name: 'favorites', order: 'id', category: 'interaction', label: '收藏', description: '用户收藏' },
  
  // 友情链接
  { name: 'friend_links', order: 'sort_order', category: 'link', label: '友情链接', description: '友情链接' },
  
  // 系统设置
  { name: 'site_settings', order: 'id', category: 'system', label: '站点设置', description: '网站基本设置' },
  { name: 'smtp_settings', order: 'id', category: 'system', label: 'SMTP设置', description: '邮件服务配置' },
  { name: 'seo_settings', order: 'id', category: 'system', label: 'SEO设置', description: 'SEO配置' },
  
  // 用户数据
  { name: 'users', order: 'id', category: 'user', label: '用户', description: '用户账号信息' },
  { name: 'email_verification_codes', order: 'id', category: 'user', label: '验证码', description: '邮箱验证码' },
  { name: 'publisher_applications', order: 'id', category: 'user', label: '发布者申请', description: '发布者申请记录' },
]

// 导出模式对应的表
const EXPORT_MODES = {
  // 全部导出
  full: TABLE_DEFINITIONS.map(t => t.name),
  // 仅业务数据（不含用户信息）
  business: TABLE_DEFINITIONS.filter(t => t.category !== 'user').map(t => t.name),
  // 仅内容和设置
  content: ['ai_tools', 'ai_news', 'ai_hall_of_fame', 'ai_timeline', 'categories', 'tags', 'tool_tags'],
  // 仅设置
  settings: ['site_settings', 'smtp_settings', 'seo_settings', 'friend_links'],
}

// 获取表定义列表 - GET请求
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  // 返回表定义列表（用于前端选择）
  if (action === 'tables') {
    // 获取每个表的数据量
    const client = getSupabaseClient()
    const tablesWithCount = await Promise.all(
      TABLE_DEFINITIONS.map(async (table) => {
        const { count, error } = await client
          .from(table.name)
          .select('*', { count: 'exact', head: true })
        
        return {
          ...table,
          count: error ? 0 : (count || 0),
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: tablesWithCount,
      categories: [
        { id: 'content', label: '内容数据', description: 'AI工具、资讯、名人堂等核心内容' },
        { id: 'taxonomy', label: '分类标签', description: '分类和标签体系' },
        { id: 'ranking', label: '排名数据', description: '工具排名相关数据' },
        { id: 'interaction', label: '互动数据', description: '评论和收藏' },
        { id: 'link', label: '友情链接', description: '友情链接数据' },
        { id: 'system', label: '系统设置', description: '站点和系统配置' },
        { id: 'user', label: '用户数据', description: '用户账号相关信息' },
      ],
    })
  }

  return NextResponse.json(
    { success: false, error: '无效的操作' },
    { status: 400 }
  )
}

// 导出数据 - POST请求
export async function POST(request: NextRequest) {
  try {
    // 验证权限
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { mode = 'business', tables = [] } = body

    // 确定要导出的表
    let tablesToExport: string[] = []
    
    if (mode === 'custom' && tables.length > 0) {
      // 自定义模式：使用用户选择的表
      tablesToExport = tables
    } else if (EXPORT_MODES[mode as keyof typeof EXPORT_MODES]) {
      // 预设模式
      tablesToExport = EXPORT_MODES[mode as keyof typeof EXPORT_MODES]
    } else {
      return NextResponse.json(
        { success: false, error: '无效的导出模式' },
        { status: 400 }
      )
    }

    const client = getSupabaseClient()
    const exportData: Record<string, any[]> = {}
    const summary: Record<string, number> = {}

    // 获取表定义映射
    const tableMap = new Map(TABLE_DEFINITIONS.map(t => [t.name, t]))

    // 导出每个表的数据
    for (const tableName of tablesToExport) {
      const tableDef = tableMap.get(tableName)
      const orderField = tableDef?.order || 'id'

      const { data, error } = await client
        .from(tableName)
        .select('*')
        .order(orderField, { ascending: true })

      if (error) {
        console.error(`导出表 ${tableName} 失败:`, error)
        exportData[tableName] = []
        summary[tableName] = 0
      } else {
        exportData[tableName] = data || []
        summary[tableName] = data?.length || 0
      }
    }

    // 添加导出元信息
    const result = {
      _meta: {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        mode,
        summary,
        totalRecords: Object.values(summary).reduce((a, b) => a + b, 0),
      },
      data: exportData,
    }

    // 生成文件名
    const modeNames: Record<string, string> = {
      full: '全部数据',
      business: '业务数据',
      content: '内容数据',
      settings: '设置数据',
      custom: '自定义',
    }
    const modeName = modeNames[mode] || '数据'
    const dateStr = new Date().toISOString().split('T')[0]
    const filename = `ai-nav-${modeName}-${dateStr}.json`

    // 返回JSON文件下载
    return new NextResponse(JSON.stringify(result, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
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
