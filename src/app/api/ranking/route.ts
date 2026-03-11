import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 生成模拟的排行榜数据
async function generateRankingData(supabase: ReturnType<typeof getSupabaseClient>) {
  // 获取所有已审核通过的工具
  const { data: tools, error: toolsError } = await supabase
    .from('ai_tools')
    .select('id, name, slug, website, logo, category_id, view_count, is_featured, is_top')
    .eq('status', 'approved')
    .order('view_count', { ascending: false })
    .limit(200)

  if (toolsError || !tools) {
    console.error('获取工具列表失败:', toolsError)
    return
  }

  // 为每个工具生成模拟的流量数据
  const today = new Date().toISOString().split('T')[0]
  const rankingData = tools.map((tool: any, index: number) => {
    // 基于现有数据生成模拟流量
    const baseVisits = Math.floor(Math.random() * 10000000) + 100000
    const featuredBonus = tool.is_featured ? 500000 : 0
    const topBonus = tool.is_top ? 1000000 : 0
    const viewBonus = (tool.view_count || 0) * 100
    
    const monthlyVisits = baseVisits + featuredBonus + topBonus + viewBonus
    const previousRank = index + Math.floor(Math.random() * 20) - 10
    
    return {
      tool_id: tool.id,
      rank: index + 1,
      previous_rank: previousRank > 0 ? previousRank : null,
      monthly_visits: monthlyVisits,
      monthly_visits_change: parseFloat((Math.random() * 40 - 10).toFixed(2)),
      category_id: tool.category_id,
      ranking_date: today
    }
  })

  // 按流量重新排序
  rankingData.sort((a: any, b: any) => b.monthly_visits - a.monthly_visits)
  rankingData.forEach((item: any, index: number) => {
    item.rank = index + 1
  })

  // 批量插入数据
  const { error: insertError } = await supabase
    .from('ai_tool_rankings')
    .insert(rankingData)

  if (insertError) {
    console.error('插入排行榜数据失败:', insertError)
    return
  }

  // 记录更新日志
  await supabase
    .from('ranking_update_log')
    .upsert({
      update_date: today,
      status: 'completed',
      completed_at: new Date().toISOString()
    })

  return rankingData
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const today = new Date().toISOString().split('T')[0]

    // 获取分页参数
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const categoryId = searchParams.get('category')
    const offset = (page - 1) * limit

    // 检查今天是否已有数据
    const { data: existingData, error: checkError } = await supabase
      .from('ai_tool_rankings')
      .select('id')
      .eq('ranking_date', today)
      .limit(1)

    if (checkError) {
      console.error('检查排行榜数据失败:', checkError)
    }

    // 如果今天没有数据，生成新数据
    if (!existingData || existingData.length === 0) {
      console.log('生成新的排行榜数据...')
      await generateRankingData(supabase)
    }

    // 构建查询 - 先获取排行榜数据
    let query = supabase
      .from('ai_tool_rankings')
      .select('id, rank, previous_rank, monthly_visits, monthly_visits_change, category_rank, tool_id', { count: 'exact' })
      .eq('ranking_date', today)
      .order('rank', { ascending: true })

    // 分类筛选
    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    // 分页
    const { data: rankings, error: rankingError, count } = await query
      .range(offset, offset + limit - 1)

    if (rankingError) {
      console.error('获取排行榜数据失败:', rankingError)
      return NextResponse.json(
        { error: '获取排行榜数据失败' },
        { status: 500 }
      )
    }

    if (!rankings || rankings.length === 0) {
      return NextResponse.json({
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
        lastUpdated: new Date().toISOString()
      })
    }

    // 获取工具详情 - 由于Supabase客户端的.in()方法问题，使用Promise.all并行查询
    const toolIds = rankings.map((r: any) => r.tool_id).filter(Boolean)
    
    // 使用Promise.all并行查询当前页所有工具
    const toolPromises = toolIds.map(id => 
      supabase
        .from('ai_tools')
        .select('id, name, slug, description, website, logo, is_free, is_featured, is_pinned, category_id')
        .eq('id', id)
        .single()
    )
    
    const toolResults = await Promise.all(toolPromises)
    const toolsList = toolResults
      .filter(r => r.data)
      .map(r => r.data)

    // 获取分类信息
    const categoryIds = [...new Set(toolsList.map((t: any) => t.category_id).filter(Boolean))]
    const { data: categoriesData } = await supabase
      .from('categories')
      .select('id, name, slug')
      .in('id', categoryIds.length > 0 ? categoryIds : [0])

    const categoryMap = new Map((categoriesData || []).map((c: any) => [c.id, c]))
    const toolMap = new Map(toolsList.map((t: any) => [t.id, {
      ...t,
      category: t.category_id ? categoryMap.get(t.category_id) || null : null
    }]))

    // 组装最终数据
    const finalData = rankings.map((r: any) => ({
      ...r,
      tool: toolMap.get(r.tool_id) || null
    }))

    // 获取更新时间
    const { data: updateLog } = await supabase
      .from('ranking_update_log')
      .select('completed_at')
      .eq('update_date', today)
      .single()

    return NextResponse.json({
      data: finalData,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      lastUpdated: updateLog?.completed_at || new Date().toISOString()
    })
  } catch (error) {
    console.error('排行榜API错误:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
