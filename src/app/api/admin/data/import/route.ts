import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 导入顺序（考虑外键依赖）
const IMPORT_ORDER = [
  'categories',
  'tags',
  'ai_tools',
  'tool_tags',
  'ai_tool_rankings',
  'ranking_update_log',
  'traffic_data_sources',
  'ai_news',
  'ai_hall_of_fame',
  'ai_timeline',
  'comments',
  'favorites',
  'friend_links',
  'site_settings',
  'smtp_settings',
  'seo_settings',
  'users',
  'email_verification_codes',
  'publisher_applications',
]

// 数据导入API - 管理员专用
export async function POST(request: NextRequest) {
  try {
    // 简单验证
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { data, mode = 'merge' } = body // mode: 'merge' 合并, 'replace' 替换

    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { success: false, error: '无效的数据格式' },
        { status: 400 }
      )
    }

    const client = getSupabaseClient()
    const results: Record<string, { imported: number; skipped: number; errors: string[] }> = {}

    // 获取所有要导入的表名
    const tablesToImport = Object.keys(data).filter(key => key !== '_meta')
    
    // 按顺序导入（先处理IMPORT_ORDER中的表，再处理其他表）
    const orderedTables = [
      ...IMPORT_ORDER.filter(t => tablesToImport.includes(t)),
      ...tablesToImport.filter(t => !IMPORT_ORDER.includes(t))
    ]

    // 按顺序导入每个表
    for (const tableName of orderedTables) {
      const tableData = data[tableName]
      
      if (!tableData || !Array.isArray(tableData) || tableData.length === 0) {
        results[tableName] = { imported: 0, skipped: 0, errors: [] }
        continue
      }

      const tableResult = { imported: 0, skipped: 0, errors: [] as string[] }

      try {
        if (mode === 'replace') {
          // 替换模式：先清空再导入
          await client.from(tableName).delete().neq('id', 0)
        }

        // 批量导入（每次最多500条）
        const batchSize = 500
        for (let i = 0; i < tableData.length; i += batchSize) {
          const batch = tableData.slice(i, i + batchSize)
          
          // 使用 upsert 处理重复数据
          const { error } = await client
            .from(tableName)
            .upsert(batch, { 
              onConflict: 'id',
              ignoreDuplicates: false 
            })

          if (error) {
            // 如果批量失败，尝试单条插入
            for (const item of batch) {
              const { error: singleError } = await client
                .from(tableName)
                .upsert(item, { onConflict: 'id' })
              
              if (singleError) {
                tableResult.errors.push(`${tableName} ID ${item.id}: ${singleError.message}`)
                tableResult.skipped++
              } else {
                tableResult.imported++
              }
            }
          } else {
            tableResult.imported += batch.length
          }
        }
      } catch (e: any) {
        tableResult.errors.push(`处理错误: ${e.message}`)
      }

      results[tableName] = tableResult
    }

    // 统计总数
    const summary = {
      totalImported: Object.values(results).reduce((sum, r) => sum + r.imported, 0),
      totalSkipped: Object.values(results).reduce((sum, r) => sum + r.skipped, 0),
      totalErrors: Object.values(results).reduce((sum, r) => sum + r.errors.length, 0),
    }

    return NextResponse.json({
      success: true,
      message: `导入完成：成功 ${summary.totalImported} 条，跳过 ${summary.totalSkipped} 条，错误 ${summary.totalErrors} 条`,
      results,
      summary,
    })
  } catch (error: any) {
    console.error('数据导入错误:', error)
    return NextResponse.json(
      { success: false, error: '导入失败：' + error.message },
      { status: 500 }
    )
  }
}
