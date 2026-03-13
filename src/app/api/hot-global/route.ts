import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 国外火爆AI工具名称列表
const FOREIGN_HOT_TOOLS = [
  'ChatGPT', 'Claude', 'Gemini', 'Midjourney', 'DALL-E', 'Stable Diffusion',
  'GitHub Copilot', 'Notion AI', 'Perplexity', 'Runway', 'Pika', 'ElevenLabs',
  'Jasper', 'Copy.ai', 'Grammarly', 'Otter.ai', 'Descript', 'Figma AI',
  'Canva', 'Adobe Firefly', 'Luma AI', 'Sora', 'Anthropic', 'OpenAI',
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '24')

    const client = getSupabaseClient()

    // 获取分类信息
    const { data: categories } = await client
      .from('categories')
      .select('id, name, slug, color')

    const categoryMap = new Map((categories || []).map(c => [c.id, c]))

    // 获取总数
    const { count } = await client
      .from('ai_tools')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')
      .in('name', FOREIGN_HOT_TOOLS)

    // 分页获取工具
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data: tools, error } = await client
      .from('ai_tools')
      .select('id, name, slug, description, website, logo, is_featured, is_free, view_count, favorite_count, created_at, category_id')
      .eq('status', 'approved')
      .in('name', FOREIGN_HOT_TOOLS)
      .order('view_count', { ascending: false })
      .order('favorite_count', { ascending: false })
      .range(from, to)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

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
    console.error('获取国外火爆工具失败:', error)
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 })
  }
}
