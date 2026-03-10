import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

/**
 * 首页聚合API - 一次请求获取所有首页数据
 * 包含：分类列表(带工具数量)、热门工具(TOP 6)、最新工具(20个)
 */
export async function GET() {
  try {
    const client = getSupabaseClient()
    
    // 1. 获取分类列表
    const { data: categories, error: categoriesError } = await client
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (categoriesError) {
      return NextResponse.json(
        { success: false, error: categoriesError.message },
        { status: 400 }
      )
    }

    // 2. 使用SQL聚合直接获取每个分类的工具数量
    const { data: countData, error: countError } = await client
      .rpc('get_tool_counts_by_category')

    // 如果RPC不存在，使用备用方案
    let countMap = new Map<number, number>()
    
    if (countError || !countData) {
      // 备用方案：直接查询所有工具的category_id
      const { data: allTools, error: toolsError } = await client
        .from('ai_tools')
        .select('category_id')
        .eq('status', 'approved')
        .limit(3000)

      if (allTools) {
        for (const tool of allTools) {
          const count = countMap.get(tool.category_id) || 0
          countMap.set(tool.category_id, count + 1)
        }
      }
    } else {
      for (const item of countData) {
        countMap.set(item.category_id, item.count)
      }
    }

    // 3. 并行获取热门工具和最新工具
    const [hotToolsResult, latestToolsResult] = await Promise.all([
      client
        .from('ai_tools')
        .select('id, name, slug, description, website, logo, is_featured, is_free, view_count, favorite_count, created_at, category_id')
        .eq('status', 'approved')
        .order('view_count', { ascending: false })
        .order('created_at', { ascending: false })
        .order('favorite_count', { ascending: false })
        .limit(6),
      
      client
        .from('ai_tools')
        .select('id, name, slug, description, website, logo, is_featured, is_free, view_count, favorite_count, created_at, category_id')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(20)
    ])

    if (hotToolsResult.error) {
      return NextResponse.json(
        { success: false, error: hotToolsResult.error.message },
        { status: 400 }
      )
    }
    if (latestToolsResult.error) {
      return NextResponse.json(
        { success: false, error: latestToolsResult.error.message },
        { status: 400 }
      )
    }

    // 创建分类映射（用于工具关联）
    const categoryMap = new Map(
      (categories || []).map(c => [c.id, c])
    )

    // 组装分类数据
    const categoriesWithCount = (categories || []).map(category => ({
      ...category,
      toolCount: countMap.get(category.id) || 0,
    }))

    // 组装工具数据（添加分类信息）
    const hotTools = (hotToolsResult.data || []).map(tool => ({
      ...tool,
      category: categoryMap.get(tool.category_id) || null,
    }))

    const latestTools = (latestToolsResult.data || []).map(tool => ({
      ...tool,
      category: categoryMap.get(tool.category_id) || null,
    }))

    return NextResponse.json({
      success: true,
      data: {
        categories: categoriesWithCount,
        hotTools,
        latestTools,
      },
    })
  } catch (error) {
    console.error('获取首页数据错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
