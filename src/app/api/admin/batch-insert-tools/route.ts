import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 批量插入工具数据
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tools } = body

    if (!Array.isArray(tools) || tools.length === 0) {
      return NextResponse.json({ error: '无效的工具数据' }, { status: 400 })
    }

    const supabase = getSupabaseClient()

    // 获取现有工具名称用于去重
    const { data: existingTools } = await supabase
      .from('ai_tools')
      .select('name, slug')
    
    const existingNames = new Set(existingTools?.map(t => t.name) || [])
    const existingSlugs = new Set(existingTools?.map(t => t.slug) || [])

    // 过滤重复的工具
    const uniqueTools = tools.filter((tool: any) => {
      return !existingNames.has(tool.name) && !existingSlugs.has(tool.slug)
    })

    if (uniqueTools.length === 0) {
      return NextResponse.json({ 
        success: true, 
        inserted: 0, 
        skipped: tools.length,
        message: '所有工具已存在，跳过插入' 
      })
    }

    // 批量插入，每次最多500条
    const batchSize = 500
    let totalInserted = 0
    const errors: string[] = []

    for (let i = 0; i < uniqueTools.length; i += batchSize) {
      const batch = uniqueTools.slice(i, i + batchSize)
      
      const { data, error } = await supabase
        .from('ai_tools')
        .insert(batch)
        .select('id')

      if (error) {
        errors.push(`批次 ${Math.floor(i / batchSize) + 1} 插入失败: ${error.message}`)
      } else {
        totalInserted += data?.length || 0
      }
    }

    return NextResponse.json({
      success: true,
      inserted: totalInserted,
      skipped: tools.length - uniqueTools.length,
      total: tools.length,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('批量插入失败:', error)
    return NextResponse.json({ 
      error: '插入失败: ' + (error as Error).message 
    }, { status: 500 })
  }
}

// 获取现有工具名称
export async function GET() {
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase
    .from('ai_tools')
    .select('name')
  
  if (error) {
    return NextResponse.json({ error: '查询失败' }, { status: 500 })
  }

  return NextResponse.json({ 
    count: data?.length || 0,
    names: data?.map(t => t.name) || [] 
  })
}
