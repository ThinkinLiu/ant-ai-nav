import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

/**
 * 首页聚合API - 一次请求获取所有首页数据
 * 包含：分类列表(带工具数量)、热门工具(TOP 6)、最新工具(20个)
 */
export async function GET() {
  try {
    const client = getSupabaseClient()
    
    // 并行执行所有查询，减少总耗时
    const [categoriesResult, toolsCountResult, hotToolsResult, latestToolsResult] = await Promise.all([
      // 1. 获取分类列表
      client
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),
      
      // 2. 获取所有已审核工具的category_id（用于计算分类工具数量）
      client
        .from('ai_tools')
        .select('category_id')
        .eq('status', 'approved'),
      
      // 3. 获取热门工具 TOP 6
      // 排序规则：
      // - 首先按浏览量降序（真实用户行为）
      // - 浏览量相同时按创建时间降序（新工具优先曝光）
      // - 创建时间相同时按收藏数降序
      client
        .from('ai_tools')
        .select('id, name, slug, description, website, logo, is_featured, is_free, view_count, favorite_count, created_at, category_id')
        .eq('status', 'approved')
        .order('view_count', { ascending: false })
        .order('created_at', { ascending: false })
        .order('favorite_count', { ascending: false })
        .limit(6),
      
      // 4. 获取最新工具 20个（按创建时间排序）
      client
        .from('ai_tools')
        .select('id, name, slug, description, website, logo, is_featured, is_free, view_count, favorite_count, created_at, category_id')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(20)
    ])

    // 检查错误
    if (categoriesResult.error) {
      return NextResponse.json(
        { success: false, error: categoriesResult.error.message },
        { status: 400 }
      )
    }
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

    // 在内存中计算每个分类的工具数量
    const countMap = new Map<number, number>()
    if (toolsCountResult.data) {
      for (const tool of toolsCountResult.data) {
        const count = countMap.get(tool.category_id) || 0
        countMap.set(tool.category_id, count + 1)
      }
    }

    // 创建分类映射（用于工具关联）
    const categoryMap = new Map(
      (categoriesResult.data || []).map(c => [c.id, c])
    )

    // 组装分类数据
    const categories = (categoriesResult.data || []).map(category => ({
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
        categories,
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
