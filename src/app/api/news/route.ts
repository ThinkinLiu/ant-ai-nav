import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 获取AI资讯列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '15')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured')
    const hot = searchParams.get('hot')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    const client = getSupabaseClient()

    let query = client
      .from('ai_news')
      .select('id, title, title_en, summary, source, source_url, category, tags, cover_image, is_featured, is_hot, view_count, like_count, published_at', { count: 'exact' })

    // 筛选条件
    if (category) {
      query = query.eq('category', category)
    }
    if (featured === 'true') {
      query = query.eq('is_featured', true)
    }
    if (hot === 'true') {
      query = query.eq('is_hot', true)
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%`)
    }
    if (dateFrom) {
      query = query.gte('published_at', dateFrom)
    }
    if (dateTo) {
      query = query.lte('published_at', dateTo)
    }

    // 按发布时间降序排序（严格按时间倒序）
    query = query.order('published_at', { ascending: false })

    // 分页
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    // 获取分类统计
    const { data: categoryStats } = await client
      .from('ai_news')
      .select('category')

    const categoryCounts: Record<string, number> = {}
    categoryStats?.forEach(item => {
      if (item.category) {
        categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        data,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
        categoryCounts,
      },
    })
  } catch (error) {
    console.error('获取AI资讯列表错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
