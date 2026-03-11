import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'
import { batchFetchTrafficData, extractDomain } from '@/lib/traffic-service'

/**
 * 同步流量数据
 * POST /api/admin/traffic-sources/sync
 */
export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient()
  
  try {
    // 获取当前激活的数据源（按优先级排序）
    const { data: dataSources, error: dsError } = await supabase
      .from('traffic_data_sources')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false })
      .limit(1)
    
    if (dsError) {
      return NextResponse.json(
        { error: '获取数据源配置失败' },
        { status: 500 }
      )
    }
    
    // 如果没有配置，使用模拟数据
    const dataSource = dataSources?.[0] || {
      id: 0,
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
      .select('id, name, website, category_id, view_count, is_featured, is_pinned')
      .eq('status', 'approved')
      .order('view_count', { ascending: false })
      .limit(200)
    
    if (toolsError || !tools) {
      return NextResponse.json(
        { error: '获取工具列表失败' },
        { status: 500 }
      )
    }
    
    // 批量获取流量数据
    const websites = tools.map(t => t.website)
    const trafficDataMap = await batchFetchTrafficData(websites, dataSource, 10)
    
    // 构建排行榜数据
    const today = new Date().toISOString().split('T')[0]
    const rankingData = tools.map((tool: any) => {
      const trafficData = trafficDataMap.get(tool.website)
      
      // 如果是模拟数据，添加一些基于网站现有数据的加权
      let monthlyVisits = trafficData?.monthlyVisits || 0
      let monthlyVisitsChange = trafficData?.monthlyVisitsChange || 0
      
      // 模拟数据时，添加权重
      if (dataSource.name === 'mock') {
        const featuredBonus = tool.is_featured ? 500000 : 0
        const pinnedBonus = tool.is_pinned ? 1000000 : 0
        const viewBonus = (tool.view_count || 0) * 100
        monthlyVisits += featuredBonus + pinnedBonus + viewBonus
      }
      
      return {
        tool_id: tool.id,
        monthly_visits: monthlyVisits,
        monthly_visits_change: monthlyVisitsChange,
        category_id: tool.category_id,
        ranking_date: today,
        previous_rank: null // 需要前一天的数据来计算
      }
    })
    
    // 按流量排序并设置排名
    rankingData.sort((a: any, b: any) => b.monthly_visits - a.monthly_visits)
    
    // 获取昨天的排名作为previous_rank
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    const { data: yesterdayRankings } = await supabase
      .from('ai_tool_rankings')
      .select('tool_id, rank')
      .eq('ranking_date', yesterday)
    
    const yesterdayRankMap = new Map(
      (yesterdayRankings || []).map((r: any) => [r.tool_id, r.rank])
    )
    
    // 设置最终排名数据
    const finalRankingData = rankingData.map((item: any, index: number) => ({
      ...item,
      rank: index + 1,
      previous_rank: yesterdayRankMap.get(item.tool_id) || null
    }))
    
    // 删除今天的旧数据
    await supabase
      .from('ai_tool_rankings')
      .delete()
      .eq('ranking_date', today)
    
    // 批量插入新数据
    const { error: insertError } = await supabase
      .from('ai_tool_rankings')
      .insert(finalRankingData)
    
    if (insertError) {
      console.error('插入排行榜数据失败:', insertError)
      return NextResponse.json(
        { error: '保存排行榜数据失败' },
        { status: 500 }
      )
    }
    
    // 更新数据源的同步状态
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
    
    return NextResponse.json({
      success: true,
      message: `成功同步 ${finalRankingData.length} 个工具的流量数据`,
      dataSource: dataSource.name,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('同步流量数据失败:', error)
    
    // 更新同步状态为失败
    const { data: activeSource } = await supabase
      .from('traffic_data_sources')
      .select('id')
      .eq('is_active', true)
      .limit(1)
      .single()
    
    if (activeSource) {
      await supabase
        .from('traffic_data_sources')
        .update({
          sync_status: 'failed',
          sync_error: String(error),
          last_sync_at: new Date().toISOString()
        })
        .eq('id', activeSource.id)
    }
    
    return NextResponse.json(
      { error: '同步流量数据失败', details: String(error) },
      { status: 500 }
    )
  }
}

/**
 * 获取同步状态
 * GET /api/admin/traffic-sources/sync
 */
export async function GET() {
  const supabase = getSupabaseClient()
  
  // 获取最近一次同步状态
  const { data: updateLog } = await supabase
    .from('ranking_update_log')
    .select('*')
    .order('update_date', { ascending: false })
    .limit(5)
  
  // 获取当前激活的数据源
  const { data: activeSource } = await supabase
    .from('traffic_data_sources')
    .select('*')
    .eq('is_active', true)
    .limit(1)
    .single()
  
  return NextResponse.json({
    activeSource: activeSource || { name: 'mock', display_name: '模拟数据' },
    recentUpdates: updateLog || []
  })
}
