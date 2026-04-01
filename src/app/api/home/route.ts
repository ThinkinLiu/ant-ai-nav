import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClientAsync } from '@/storage/database/supabase-client'

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
    const client = await getSupabaseClientAsync()
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
        { status: 500 }
      )
    }

    // 2. 获取公告（仅启用的）
    const { data: announcements, error: announcementsError } = await client
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(3)

    if (announcementsError) {
      return NextResponse.json(
        { success: false, error: announcementsError.message },
        { status: 500 }
      )
    }

    // 3. 获取热门工具（按浏览量排序）
    const { data: hotTools, error: hotToolsError } = await client
      .from('tools')
      .select('id, name, slug, description, logo_url, category_id, tags, view_count, created_at, is_approved')
      .eq('is_approved', true)
      .order('view_count', { ascending: false })
      .limit(8)

    if (hotToolsError) {
      return NextResponse.json(
        { success: false, error: hotToolsError.message },
        { status: 500 }
      )
    }

    // 4. 获取最新工具
    const { data: latestTools, error: latestToolsError } = await client
      .from('tools')
      .select('id, name, slug, description, logo_url, category_id, tags, view_count, created_at, is_approved')
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(12)

    if (latestToolsError) {
      return NextResponse.json(
        { success: false, error: latestToolsError.message },
        { status: 500 }
      )
    }

    // 5. 获取推荐工具（精选）
    const { data: featuredTools, error: featuredToolsError } = await client
      .from('tools')
      .select('id, name, slug, description, logo_url, category_id, tags, view_count, created_at, is_featured, is_approved')
      .eq('is_approved', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(6)

    if (featuredToolsError) {
      return NextResponse.json(
        { success: false, error: featuredToolsError.message },
        { status: 500 }
      )
    }

    // 6. 获取国内热门工具（按名称匹配）
    const { data: domesticTools, error: domesticToolsError } = await client
      .from('tools')
      .select('id, name, slug, description, logo_url, category_id, tags, view_count, is_approved')
      .eq('is_approved', true)
      .in('name', domesticHotTools.slice(0, 20))
      .limit(10)

    if (domesticToolsError) {
      console.error('获取国内工具失败:', domesticToolsError)
    }

    // 7. 获取国外热门工具（按名称匹配）
    const { data: foreignTools, error: foreignToolsError } = await client
      .from('tools')
      .select('id, name, slug, description, logo_url, category_id, tags, view_count, is_approved')
      .eq('is_approved', true)
      .in('name', foreignHotTools.slice(0, 20))
      .limit(10)

    if (foreignToolsError) {
      console.error('获取国外工具失败:', foreignToolsError)
    }

    return NextResponse.json({
      success: true,
      data: {
        categories: categories || [],
        announcements: announcements || [],
        hotTools: hotTools || [],
        latestTools: latestTools || [],
        featuredTools: featuredTools || [],
        domesticHotTools: domesticTools || [],
        foreignHotTools: foreignTools || [],
        domesticHotToolNames: domesticHotTools,
        foreignHotToolNames: foreignHotTools,
        lobsterTagKeywords
      }
    })

  } catch (error: any) {
    console.error('首页API错误:', error)
    
    // 如果是数据库未配置错误，返回特殊的提示
    if (error.message && error.message.includes('not configured')) {
      return NextResponse.json({
        success: false,
        error: 'Database not configured',
        message: '请先配置数据库连接'
      }, { status: 400 })
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
