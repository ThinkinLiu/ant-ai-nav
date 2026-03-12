import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 国内火爆AI工具名称列表（扩展版）
const domesticHotTools = [
  // AI对话/大模型
  'DeepSeek', 'Kimi智能助手', '通义千问', '文心一言', '讯飞星火', '豆包',
  '智谱清言', '腾讯混元', '百川大模型', '商量SenseChat', 'MiniMax', '阶跃星辰',
  '天工AI', '海螺AI', '秘塔AI搜索', '360智脑', '紫东太初', 'MOSS',
  // AI绘画
  '即梦AI', '可灵AI', '通义万相', '文心一格', '无界AI', '堆友',
  '美图设计室', 'liblibAI', '6pen', 'Vega AI', 'Tiamat', '画宇宙',
  '意间AI', '盗梦师', '吐司AI', '日漫世界', 'MewXAI',
  // AI视频
  '可灵视频', '即梦视频', '智影', 'Vidu', 'PixVerse', '必剪AI',
  '剪映', '快影', '度加', '来画', '右脑', '数字人开放平台',
  // AI写作
  '秘塔写作猫', '火山写作', '彩云小梦', '讯飞写作', '笔灵AI', '写作蛙',
  '灵感岛', 'Effidit', '秒写作', '深言达意',
  // AI编程
  '通义灵码', '百度Comate', '豆包MarsCode', 'CodeGeeX', '腾讯云AI代码',
  '华为云CodeArts', '讯飞iFlyCode', 'AIGCode', '天工开物',
  // AI音频
  '魔音工坊', 'Suno AI', 'Udio', '网易天音', '天工音乐', '酷狗AI音乐',
  '讯飞配音', '火山引擎语音', '腾讯云语音', '百度语音', '阿里云语音',
  // AI办公
  '飞书AI', '钉钉AI', '石墨文档AI', '语雀AI', 'WPS AI', '腾讯文档AI',
  '有道云笔记AI', '印象笔记AI', 'ProcessOn', 'Canva可画', '即时设计',
  // AI学习
  '作业帮AI', '小猿搜题', '学而思AI', '流利说', '开言英语',
]

// 国外火爆AI工具名称列表（扩展版）
const foreignHotTools = [
  // AI对话/大模型
  'ChatGPT', 'Claude', 'Gemini', 'Perplexity', 'Poe', 'Character.AI',
  'Anthropic', 'OpenAI', 'Meta AI', 'Copilot', 'Groq', 'Mistral AI',
  // AI绘画
  'Midjourney', 'DALL-E', 'Stable Diffusion', 'Leonardo AI', 'Ideogram',
  'Adobe Firefly', 'Playground AI', 'Lexica', 'NightCafe', 'Civitai',
  // AI视频
  'Runway', 'Pika', 'Sora', 'Luma AI', 'Kaiber', 'Synthesia',
  'HeyGen', 'D-ID', 'Descript', 'Invideo AI',
  // AI编程
  'GitHub Copilot', 'Cursor', 'Replit AI', 'Codeium', 'Tabnine',
  'Amazon CodeWhisperer', 'Sourcegraph', 'Vercel AI',
  // AI音频
  'ElevenLabs', 'Suno', 'Udio', 'Murf AI', 'Resemble AI',
  'Speechify', 'Podcastle', 'AIVA',
  // AI写作
  'Jasper', 'Copy.ai', 'Grammarly', 'Writesonic', 'Rytr',
  'Sudowrite', 'NovelAI', 'Quillbot',
  // AI办公
  'Notion AI', 'Figma AI', 'Canva', 'Otter.ai', 'Mem',
  'Coda AI', 'Slack AI', 'Zoom AI',
]

/**
 * 火爆工具API - 支持国内/国外分类和分页
 * 参数:
 * - type: 'domestic' | 'foreign' | 'all' (默认 'all')
 * - page: 页码 (默认 1)
 * - limit: 每页数量 (默认 16)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '16', 10)
    const offset = (page - 1) * limit

    const client = getSupabaseClient()

    // 获取分类映射
    const { data: categories } = await client
      .from('categories')
      .select('id, name, slug, color')
    
    const categoryMap = new Map(
      (categories || []).map(c => [c.id, c])
    )

    let tools: any[] = []
    let totalCount = 0

    if (type === 'domestic') {
      // 获取国内火爆工具
      const { data, error, count } = await client
        .from('ai_tools')
        .select('id, name, slug, description, website, logo, is_featured, is_pinned, is_free, view_count, favorite_count, created_at, category_id', { count: 'exact' })
        .eq('status', 'approved')
        .in('name', domesticHotTools)
        .order('view_count', { ascending: false })
        .order('favorite_count', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        )
      }

      tools = (data || []).map(tool => ({
        ...tool,
        category: categoryMap.get(tool.category_id) || null,
      }))
      totalCount = count || 0

    } else if (type === 'foreign') {
      // 获取国外火爆工具
      const { data, error, count } = await client
        .from('ai_tools')
        .select('id, name, slug, description, website, logo, is_featured, is_pinned, is_free, view_count, favorite_count, created_at, category_id', { count: 'exact' })
        .eq('status', 'approved')
        .in('name', foreignHotTools)
        .order('view_count', { ascending: false })
        .order('favorite_count', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        )
      }

      tools = (data || []).map(tool => ({
        ...tool,
        category: categoryMap.get(tool.category_id) || null,
      }))
      totalCount = count || 0

    } else {
      // 获取所有火爆工具
      const allHotTools = [...domesticHotTools, ...foreignHotTools]
      
      const { data, error, count } = await client
        .from('ai_tools')
        .select('id, name, slug, description, website, logo, is_featured, is_pinned, is_free, view_count, favorite_count, created_at, category_id', { count: 'exact' })
        .eq('status', 'approved')
        .in('name', allHotTools)
        .order('view_count', { ascending: false })
        .order('favorite_count', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        )
      }

      // 标记是国内还是国外
      tools = (data || []).map(tool => ({
        ...tool,
        category: categoryMap.get(tool.category_id) || null,
        isDomestic: domesticHotTools.includes(tool.name),
      }))
      totalCount = count || 0
    }

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      success: true,
      data: {
        tools,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages,
          hasMore: page < totalPages,
        },
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
