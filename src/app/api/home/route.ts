import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 国内火爆AI工具名称列表
const domesticHotTools = [
  'DeepSeek', 'Kimi智能助手', '通义千问', '文心一言', '讯飞星火', '豆包',
  '智谱清言', '腾讯混元', '百川大模型', '商量SenseChat', 'MiniMax', '阶跃星辰',
  '天工AI', '海螺AI', '秘塔AI搜索', '即梦AI', '可灵AI', '通义万相', '文心一格',
  '无界AI', '堆友', '美图设计室', 'liblibAI', '剪映AI', '必剪', '快影',
  '秘塔写作猫', '火山写作', '彩云小梦', '通义灵码', '百度Comate', '豆包MarsCode',
  '飞书AI', '钉钉AI', '石墨文档AI', '魔音工坊', 'Suno AI', 'Udio',
]

// 国外火爆AI工具名称列表
const foreignHotTools = [
  'ChatGPT', 'Claude', 'Gemini', 'Midjourney', 'DALL-E', 'Stable Diffusion',
  'GitHub Copilot', 'Notion AI', 'Perplexity', 'Runway', 'Pika', 'ElevenLabs',
  'Jasper', 'Copy.ai', 'Grammarly', 'Otter.ai', 'Descript', 'Figma AI',
  'Canva', 'Adobe Firefly', 'Luma AI', 'Sora', 'Anthropic', 'OpenAI',
]

/**
 * 首页聚合API - 一次请求获取所有首页数据
 * 包含：分类列表(带工具数量)、国内火爆工具(8个)、热门工具(TOP 6)、最新工具(16个)
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

    // 3. 并行获取国内火爆工具、国外火爆工具、热门工具和最新工具
    const [domesticToolsResult, foreignToolsResult, hotToolsResult, latestToolsResult] = await Promise.all([
      // 国内火爆AI工具（按名称匹配，最多8个）
      client
        .from('ai_tools')
        .select('id, name, slug, description, website, logo, is_featured, is_pinned, is_free, view_count, favorite_count, created_at, category_id')
        .eq('status', 'approved')
        .in('name', domesticHotTools)
        .limit(8),
      
      // 国外火爆AI工具（按名称匹配，最多8个）
      client
        .from('ai_tools')
        .select('id, name, slug, description, website, logo, is_featured, is_pinned, is_free, view_count, favorite_count, created_at, category_id')
        .eq('status', 'approved')
        .in('name', foreignHotTools)
        .limit(8),
      
      // 热门工具（按浏览量排序）
      client
        .from('ai_tools')
        .select('id, name, slug, description, website, logo, is_featured, is_pinned, is_free, view_count, favorite_count, created_at, category_id')
        .eq('status', 'approved')
        .order('view_count', { ascending: false })
        .order('created_at', { ascending: false })
        .order('favorite_count', { ascending: false })
        .limit(6),
      
      // 最新上架（16个，2排，优先展示置顶工具）
      client
        .from('ai_tools')
        .select('id, name, slug, description, website, logo, is_featured, is_pinned, is_free, view_count, favorite_count, created_at, category_id')
        .eq('status', 'approved')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(16)
    ])

    if (domesticToolsResult.error) {
      console.error('获取国内火爆工具错误:', domesticToolsResult.error.message)
    }
    if (foreignToolsResult.error) {
      console.error('获取国外火爆工具错误:', foreignToolsResult.error.message)
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

    // 创建分类映射（用于工具关联）
    const categoryMap = new Map(
      (categories || []).map(c => [c.id, c])
    )

    // 计算总工具数量
    const totalToolCount = Array.from(countMap.values()).reduce((sum, count) => sum + count, 0)

    // 组装分类数据
    const categoriesWithCount = (categories || []).map(category => ({
      ...category,
      toolCount: countMap.get(category.id) || 0,
    }))

    // 组装工具数据（添加分类信息）
    const domesticTools = (domesticToolsResult.data || []).map(tool => ({
      ...tool,
      category: categoryMap.get(tool.category_id) || null,
    }))

    const foreignTools = (foreignToolsResult.data || []).map(tool => ({
      ...tool,
      category: categoryMap.get(tool.category_id) || null,
    }))

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
        totalToolCount,
        domesticTools,
        foreignTools,
        hotTools,
        latestTools,
      },
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    })
  } catch (error) {
    console.error('获取首页数据错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
