import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'
import { batchFetchTrafficData } from '@/lib/traffic-service'

// 生成排行榜数据
async function generateRankingData(supabase: ReturnType<typeof getSupabaseClient>) {
  // 获取当前激活的数据源
  const { data: dataSources } = await supabase
    .from('traffic_data_sources')
    .select('*')
    .eq('is_active', true)
    .order('priority', { ascending: false })
    .limit(1)
  
  const dataSource = dataSources?.[0] || {
    name: 'mock',
    display_name: '模拟数据',
    api_key: null,
    api_endpoint: null,
    is_active: true,
    priority: 0,
    config: null
  }
  
  // 获取所有已审核通过的工具
  const { data: tools, error: toolsError } = await supabase
    .from('ai_tools')
    .select('id, name, slug, website, logo, category_id, view_count, is_featured, is_pinned')
    .eq('status', 'approved')
    .order('view_count', { ascending: false })
    .limit(200)

  if (toolsError || !tools) {
    console.error('获取工具列表失败:', toolsError)
    return
  }
  
  // 批量获取流量数据
  const websites = tools.map((t: any) => t.website)
  const trafficDataMap = await batchFetchTrafficData(websites, dataSource, 10)

  // 获取昨天的排名
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  const { data: yesterdayRankings } = await supabase
    .from('ai_tool_rankings')
    .select('tool_id, rank')
    .eq('ranking_date', yesterday)
  
  const yesterdayRankMap = new Map(
    (yesterdayRankings || []).map((r: any) => [r.tool_id, r.rank])
  )

  // 为每个工具构建排行榜数据
  const rankingData = tools.map((tool: any) => {
    const trafficData = trafficDataMap.get(tool.website)
    
    // 获取流量数据
    let monthlyVisits = trafficData?.monthlyVisits || 0
    let monthlyVisitsChange = trafficData?.monthlyVisitsChange || 0
    
    // 如果是模拟数据，添加权重
    if (dataSource.name === 'mock' || !dataSource.api_key) {
      const featuredBonus = tool.is_featured ? 500000 : 0
      const pinnedBonus = tool.is_pinned ? 1000000 : 0
      const viewBonus = (tool.view_count || 0) * 100
      monthlyVisits = trafficData?.monthlyVisits || 0
      monthlyVisits += featuredBonus + pinnedBonus + viewBonus
    }
    
    return {
      tool_id: tool.id,
      monthly_visits: monthlyVisits,
      monthly_visits_change: monthlyVisitsChange,
      category_id: tool.category_id,
      ranking_date: today,
      previous_rank: yesterdayRankMap.get(tool.id) || null
    }
  })

  // 按流量排序并设置排名
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

  // 更新数据源同步状态
  if (dataSource.id) {
    await supabase
      .from('traffic_data_sources')
      .update({
        last_sync_at: new Date().toISOString(),
        sync_status: 'success'
      })
      .eq('id', dataSource.id)
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

    // 获取工具详情 - 使用Promise.all并行查询当前页所有工具
    const toolIds = rankings.map((r: any) => r.tool_id).filter(Boolean)
    
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

    // 获取更新时间和数据源信息
    const { data: updateLog } = await supabase
      .from('ranking_update_log')
      .select('completed_at')
      .eq('update_date', today)
      .single()
    
    const { data: activeSource } = await supabase
      .from('traffic_data_sources')
      .select('name, display_name')
      .eq('is_active', true)
      .limit(1)
      .single()

    return NextResponse.json({
      data: finalData,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      lastUpdated: updateLog?.completed_at || new Date().toISOString(),
      dataSource: activeSource || { name: 'mock', display_name: '模拟数据' }
    })
  } catch (error) {
    console.error('排行榜API错误:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
