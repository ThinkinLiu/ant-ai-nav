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

/**
 * 获取火爆AI工具列表
 * 支持分页和类型筛选（国内/国外）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'domestic' // domestic 或 foreign
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '16')

    const client = getSupabaseClient()

    // 根据类型选择工具名称列表
    const toolNames = type === 'foreign' ? foreignHotTools : domesticHotTools

    // 获取分类信息
    const { data: categories } = await client
      .from('categories')
      .select('id, name, slug, description, icon, color')

    const categoryMap = new Map(
      (categories || []).map(c => [c.id, c])
    )

    // 获取总数
    const { count: total, error: countError } = await client
      .from('ai_tools')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')
      .in('name', toolNames)

    if (countError) {
      return NextResponse.json(
        { success: false, error: countError.message },
        { status: 400 }
      )
    }

    // 分页获取工具
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data: tools, error: toolsError } = await client
      .from('ai_tools')
      .select('id, name, slug, description, website, logo, is_featured, is_pinned, is_free, view_count, favorite_count, created_at, category_id')
      .eq('status', 'approved')
      .in('name', toolNames)
      .order('view_count', { ascending: false })
      .order('favorite_count', { ascending: false })
      .range(from, to)

    if (toolsError) {
      return NextResponse.json(
        { success: false, error: toolsError.message },
        { status: 400 }
      )
    }

    // 添加分类信息
    const toolsWithCategory = (tools || []).map(tool => ({
      ...tool,
      category: categoryMap.get(tool.category_id) || null,
    }))

    return NextResponse.json({
      success: true,
      data: {
        data: toolsWithCategory,
        total: total || 0,
        page,
        limit,
        totalPages: Math.ceil((total || 0) / limit),
        type,
        typeName: type === 'foreign' ? '国外火爆AI工具' : '国内火爆AI工具',
      },
    })
  } catch (error) {
    console.error('获取火爆工具错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
