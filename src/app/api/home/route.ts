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

// 龙虾专区标签关键字
const lobsterTagKeywords = ['龙虾', 'OpenClaw']

// 随机选取数组中的n个元素
function getRandomItems<T>(array: T[], count: number): T[] {
  if (array.length <= count) return array
  const shuffled = [...array].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

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

    // 2. 使用 Supabase count 功能统计每个分类的工具数量
    const countMap = new Map<number, number>()

    for (const category of categories || []) {
      const { count } = await client
        .from('ai_tools')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')
        .eq('category_id', category.id)

      if (count !== null) {
        countMap.set(category.id, count)
      }
    }

    // 3. 获取Tab配置（只获取显示的Tab）
    const { data: tabs, error: tabsError } = await client
      .from('home_tabs')
      .select('*')
      .eq('is_visible', true)
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
          // 火爆工具：获取所有符合条件的数据，随机选取8个
          const hotResult = await client
            .from('ai_tools')
            .select('id, name, slug, description, website, logo, is_featured, is_pinned, is_free, view_count, favorite_count, created_at, category_id')
            .eq('status', 'approved')
            .order('view_count', { ascending: false })
            .limit(50)
          const hotToolsData = (hotResult.data || []).map(tool => ({
            ...tool,
            category: categoryMap.get(tool.category_id) || null,
          }))
          tabTools = getRandomItems(hotToolsData, 8)
          break
          
        case 'domestic_tools':
          // 国内火爆：获取所有符合条件的数据，随机选取8个
          const domesticResult = await client
            .from('ai_tools')
            .select('id, name, slug, description, website, logo, is_featured, is_pinned, is_free, view_count, favorite_count, created_at, category_id')
            .eq('status', 'approved')
            .in('name', domesticHotTools)
            .limit(50)
          const domesticToolsData = (domesticResult.data || []).map(tool => ({
            ...tool,
            category: categoryMap.get(tool.category_id) || null,
          }))
          tabTools = getRandomItems(domesticToolsData, 8)
          break
          
        case 'foreign_tools':
          // 国外火爆：获取所有符合条件的数据，随机选取8个
          const foreignResult = await client
            .from('ai_tools')
            .select('id, name, slug, description, website, logo, is_featured, is_pinned, is_free, view_count, favorite_count, created_at, category_id')
            .eq('status', 'approved')
            .in('name', foreignHotTools)
            .limit(50)
          const foreignToolsData = (foreignResult.data || []).map(tool => ({
            ...tool,
            category: categoryMap.get(tool.category_id) || null,
          }))
          tabTools = getRandomItems(foreignToolsData, 8)
          break
          
        case 'lobster_tools':
          // 龙虾专区：查询名称是"龙虾"或"OpenClaw"的标签关联的工具
          // 1. 查询名称精确匹配的标签
          const orCondition = lobsterTagKeywords.map(k => `name.eq.${k}`).join(',')
          const { data: lobsterTags } = await client
            .from('tags')
            .select('id')
            .or(orCondition)
          
          let lobsterToolsData: any[] = []
          
          if (lobsterTags && lobsterTags.length > 0) {
            // 2. 通过tool_tags查询tool_id列表
            const tagIds = lobsterTags.map(t => t.id)
            const { data: toolTagsData } = await client
              .from('tool_tags')
              .select('tool_id')
              .in('tag_id', tagIds)
              .limit(50)
            
            const toolIds = toolTagsData?.map(tt => tt.tool_id) || []
            
            // 3. 用tool_id列表查询工具详情
            if (toolIds.length > 0) {
              const { data: toolsData } = await client
                .from('ai_tools')
                .select('id, name, slug, description, website, logo, is_featured, is_pinned, is_free, view_count, favorite_count, created_at, category_id')
                .eq('status', 'approved')
                .in('id', toolIds)
                .limit(50)
              
              lobsterToolsData = (toolsData || []).map(tool => ({
                ...tool,
                category: categoryMap.get(tool.category_id) || null,
              }))
            }
          }
          
          // 去重后随机选取8个
          const uniqueLobsterTools = Array.from(
            new Map(lobsterToolsData.map((t: any) => [t.id, t])).values()
          )
          tabTools = getRandomItems(uniqueLobsterTools, 8)
          break
          
        case 'tutorial_tools':
          // 热门教程：获取分类为"教程指南"（tutorial）的AI资讯，按发布时间排序，随机选取8个
          const tutorialNewsResult = await client
            .from('ai_news')
            .select('id, title, summary, cover_image, category, published_at, view_count')
            .eq('status', 'approved')
            .eq('category', 'tutorial')
            .order('published_at', { ascending: false })
            .limit(30)
          tabNews = getRandomItems(tutorialNewsResult.data || [], 8)
          break
          
        case 'category':
          if (currentTab.source_id) {
            // 分类工具：获取所有符合条件的数据，随机选取8个
            const categoryResult = await client
              .from('ai_tools')
              .select('id, name, slug, description, website, logo, is_featured, is_pinned, is_free, view_count, favorite_count, created_at, category_id')
              .eq('status', 'approved')
              .eq('category_id', currentTab.source_id)
              .limit(50)
            const categoryToolsData = (categoryResult.data || []).map(tool => ({
              ...tool,
              category: categoryMap.get(tool.category_id) || null,
            }))
            tabTools = getRandomItems(categoryToolsData, 8)
          }
          break
          
        case 'tag':
          if (currentTab.source_id) {
            // 标签工具：通过tool_tags查询tool_id，再查询工具详情
            const { data: tagToolIds } = await client
              .from('tool_tags')
              .select('tool_id')
              .eq('tag_id', currentTab.source_id)
              .limit(50)
            
            const toolIds = tagToolIds?.map(tt => tt.tool_id) || []
            
            if (toolIds.length > 0) {
              const { data: toolsData } = await client
                .from('ai_tools')
                .select('id, name, slug, description, website, logo, is_featured, is_pinned, is_free, view_count, favorite_count, created_at, category_id')
                .eq('status', 'approved')
                .in('id', toolIds)
                .limit(50)
              
              const tagToolsData = (toolsData || []).map(tool => ({
                ...tool,
                category: categoryMap.get(tool.category_id) || null,
              }))
              tabTools = getRandomItems(tagToolsData, 8)
            }
          }
          break
          
        case 'news':
          // 资讯：随机选取8条
          const newsResult = await client
            .from('ai_news')
            .select('id, title, summary, cover_image, category, published_at, view_count')
            .eq('status', 'approved')
            .order('published_at', { ascending: false })
            .limit(30)
          tabNews = getRandomItems(newsResult.data || [], 8)
          break
          
        case 'fame':
          // 名人堂：从推荐人物中随机选取8个，如果不足则从所有人物中补充
          const featuredFameResult = await client
            .from('ai_hall_of_fame')
            .select('id, name, name_en, photo, title')
            .eq('is_featured', true)
            .limit(30)
          
          if (featuredFameResult.data && featuredFameResult.data.length >= 8) {
            tabFame = getRandomItems(featuredFameResult.data, 8)
          } else {
            // 推荐人物不足8个，从所有人物中选取
            const allFameResult = await client
              .from('ai_hall_of_fame')
              .select('id, name, name_en, photo, title')
              .limit(30)
            tabFame = getRandomItems(allFameResult.data || [], 8)
          }
          break
          
        case 'timeline':
          // 大事纪：从里程碑事件中随机选取8个
          const landmarkTimelineResult = await client
            .from('ai_timeline')
            .select('id, year, month, day, title')
            .eq('importance', 'landmark')
            .limit(30)
          
          if (landmarkTimelineResult.data && landmarkTimelineResult.data.length >= 8) {
            tabTimeline = getRandomItems(landmarkTimelineResult.data, 8)
          } else {
            // 里程碑不足8个，从所有大事纪中补充
            const allTimelineResult = await client
              .from('ai_timeline')
              .select('id, year, month, day, title')
              .limit(30)
            tabTimeline = getRandomItems(allTimelineResult.data || [], 8)
          }
          break
          
        case 'ranking':
          // 排行榜：获取前8个
          const rankingResult = await client
            .from('ai_tools')
            .select('id, name, slug, description, website, logo, is_featured, is_pinned, is_free, view_count, favorite_count, created_at, category_id')
            .eq('status', 'approved')
            .order('view_count', { ascending: false })
            .limit(8)
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
