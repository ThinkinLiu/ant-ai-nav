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
 * 火爆AI工具API
 * 支持参数：
 * - type: 'domestic' | 'foreign' (必填)
 * - page: 页码 (默认1)
 * - limit: 每页数量 (默认24)
 * - categoryId: 分类ID筛选 (可选)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'domestic'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '24')
    const categoryId = searchParams.get('categoryId')

    // 验证type参数
    if (type !== 'domestic' && type !== 'foreign') {
      return NextResponse.json(
        { success: false, error: '无效的type参数，必须是 domestic 或 foreign' },
        { status: 400 }
      )
    }

    const client = getSupabaseClient()

    // 根据类型选择工具名称列表
    const toolNames = type === 'domestic' ? domesticHotTools : foreignHotTools

    // 获取分类映射
    const { data: categories } = await client
      .from('categories')
      .select('id, name, slug, color')

    const categoryMap = new Map(
      (categories || []).map(c => [c.id, c])
    )

    // 第一步：获取符合名称条件的工具ID列表
    const { data: matchedTools, error: matchError } = await client
      .from('ai_tools')
      .select('id, name')
      .eq('status', 'approved')
      .in('name', toolNames)

    if (matchError) {
      console.error('查询工具失败:', matchError)
      return NextResponse.json(
        { success: false, error: matchError.message },
        { status: 400 }
      )
    }

    // 提取匹配的工具ID
    const matchedIds = (matchedTools || []).map(t => t.id)

    if (matchedIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          tools: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
      })
    }

    // 第二步：根据分类筛选（如果有）
    let filteredIds = matchedIds
    if (categoryId) {
      const { data: categoryTools } = await client
        .from('ai_tools')
        .select('id')
        .in('id', matchedIds)
        .eq('category_id', parseInt(categoryId))
      
      filteredIds = (categoryTools || []).map(t => t.id)
    }

    if (filteredIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          tools: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
      })
    }

    // 第三步：分页查询工具详情
    const offset = (page - 1) * limit
    
    const { data: tools, error: toolsError, count } = await client
      .from('ai_tools')
      .select('id, name, slug, description, website, logo, is_featured, is_free, view_count, favorite_count, created_at, category_id', { count: 'exact' })
      .in('id', filteredIds)
      .order('view_count', { ascending: false })
      .order('favorite_count', { ascending: false })
      .range(offset, offset + limit - 1)

    if (toolsError) {
      console.error('查询工具详情失败:', toolsError)
      return NextResponse.json(
        { success: false, error: toolsError.message },
        { status: 400 }
      )
    }

    // 组装数据
    const toolsWithCategory = (tools || []).map(tool => ({
      ...tool,
      category: categoryMap.get(tool.category_id) || null,
    }))

    return NextResponse.json({
      success: true,
      data: {
        tools: toolsWithCategory,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
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
