import { NextRequest, NextResponse } from 'next/server'
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

// 龙虾专区关键字
const lobsterKeywords = ['龙虾', 'OpenClaw', 'Lobster']

/**
 * 首页聚合API - 一次请求获取所有首页数据
 */
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient()
    const { searchParams } = new URL(request.url)
    const tabSlug = searchParams.get('tab') // 获取当前Tab
    
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

    let countMap = new Map<number, number>()
    
    if (countError || !countData) {
      const { data: allTools } = await client
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

    // 3. 获取Tab配置
    const { data: tabs, error: tabsError } = await client
      .from('home_tabs')
      .select('*')
      .order('sort_order', { ascending: true })

    if (tabsError) {
      console.error('获取Tab配置错误:', tabsError.message)
    }

    // 4. 并行获取热门工具和最新工具
    const [hotToolsResult, latestToolsResult] = await Promise.all([
      client
        .from('ai_tools')
        .select('id, name, slug, description, website, logo, is_featured, is_pinned, is_free, view_count, favorite_count, created_at, category_id')
        .eq('status', 'approved')
        .order('view_count', { ascending: false })
        .order('created_at', { ascending: false })
        .order('favorite_count', { ascending: false })
        .limit(6),
      
      client
        .from('ai_tools')
        .select('id, name, slug, description, website, logo, is_featured, is_pinned, is_free, view_count, favorite_count, created_at, category_id')
        .eq('status', 'approved')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(16)
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

    // 创建分类映射
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

    // 获取Tab数据
    let tabTools: any[] = []
    let tabNews: any[] = []
    let tabFame: any[] = []
    let tabTimeline: any[] = []
    
    // 找到当前Tab或默认Tab
    const currentTab = tabs?.find(t => t.slug === tabSlug) || tabs?.find(t => t.is_default) || tabs?.[0]
    
    if (currentTab) {
      // 根据Tab类型获取数据
      switch (currentTab.type) {
        case 'hot_tools':
          const hotResult = await client
            .from('ai_tools')
            .select('id, name, slug, description, website, logo, is_featured, is_pinned, is_free, view_count, favorite_count, created_at, category_id')
            .eq('status', 'approved')
            .order('view_count', { ascending: false })
            .limit(16)
          tabTools = (hotResult.data || []).map(tool => ({
            ...tool,
            category: categoryMap.get(tool.category_id) || null,
          }))
          break
          
        case 'domestic_tools':
          const domesticResult = await client
            .from('ai_tools')
            .select('id, name, slug, description, website, logo, is_featured, is_pinned, is_free, view_count, favorite_count, created_at, category_id')
            .eq('status', 'approved')
            .in('name', domesticHotTools)
            .limit(16)
          tabTools = (domesticResult.data || []).map(tool => ({
            ...tool,
            category: categoryMap.get(tool.category_id) || null,
          }))
          break
          
        case 'foreign_tools':
          const foreignResult = await client
            .from('ai_tools')
            .select('id, name, slug, description, website, logo, is_featured, is_pinned, is_free, view_count, favorite_count, created_at, category_id')
            .eq('status', 'approved')
            .in('name', foreignHotTools)
            .limit(16)
          tabTools = (foreignResult.data || []).map(tool => ({
            ...tool,
            category: categoryMap.get(tool.category_id) || null,
          }))
          break
          
        case 'lobster_tools':
          // 龙虾专区：名称包含"龙虾"或"OpenClaw"的工具
          const lobsterResult = await client
            .from('ai_tools')
            .select('id, name, slug, description, website, logo, is_featured, is_pinned, is_free, view_count, favorite_count, created_at, category_id')
            .eq('status', 'approved')
            .or(lobsterKeywords.map(k => `name.ilike.%${k}%`).join(','))
            .limit(16)
          tabTools = (lobsterResult.data || []).map(tool => ({
            ...tool,
            category: categoryMap.get(tool.category_id) || null,
          }))
          break
          
        case 'category':
          if (currentTab.source_id) {
            const categoryResult = await client
              .from('ai_tools')
              .select('id, name, slug, description, website, logo, is_featured, is_pinned, is_free, view_count, favorite_count, created_at, category_id')
              .eq('status', 'approved')
              .eq('category_id', currentTab.source_id)
              .limit(16)
            tabTools = (categoryResult.data || []).map(tool => ({
              ...tool,
              category: categoryMap.get(tool.category_id) || null,
            }))
          }
          break
          
        case 'tag':
          if (currentTab.source_id) {
            const tagResult = await client
              .from('tool_tags')
              .select(`
                tool_id,
                ai_tools (
                  id, name, slug, description, website, logo, is_featured, is_pinned, is_free, view_count, favorite_count, created_at, category_id
                )
              `)
              .eq('tag_id', currentTab.source_id)
              .limit(16)
            tabTools = tagResult.data
              ?.map((tt: any) => tt.ai_tools)
              .filter(Boolean)
              .filter((t: any) => t.status === 'approved')
              .map((tool: any) => ({
                ...tool,
                category: categoryMap.get(tool.category_id) || null,
              })) || []
          }
          break
          
        case 'news':
          const newsResult = await client
            .from('ai_news')
            .select('id, title, summary, cover_image, category, published_at, view_count')
            .eq('status', 'approved')
            .order('published_at', { ascending: false })
            .limit(16)
          tabNews = newsResult.data || []
          break
          
        case 'fame':
          const fameResult = await client
            .from('hall_of_fame')
            .select('*')
            .eq('is_visible', true)
            .order('sort_order', { ascending: true })
            .limit(16)
          tabFame = fameResult.data || []
          break
          
        case 'timeline':
          const timelineResult = await client
            .from('ai_timeline')
            .select('*')
            .eq('is_visible', true)
            .order('event_date', { ascending: false })
            .limit(16)
          tabTimeline = timelineResult.data || []
          break
          
        case 'ranking':
          const rankingResult = await client
            .from('ai_tools')
            .select('id, name, slug, description, website, logo, is_featured, is_pinned, is_free, view_count, favorite_count, created_at, category_id')
            .eq('status', 'approved')
            .order('view_count', { ascending: false })
            .limit(16)
          tabTools = (rankingResult.data || []).map(tool => ({
            ...tool,
            category: categoryMap.get(tool.category_id) || null,
          }))
          break
      }
    }

    // 组装工具数据
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
        tabs: tabs || [],
        currentTab: currentTab || null,
        tabTools,
        tabNews,
        tabFame,
        tabTimeline,
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
