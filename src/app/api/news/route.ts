import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 获取AI资讯列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const authorId = searchParams.get('authorId')
    const sortBy = searchParams.get('sortBy') || 'published_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const client = getSupabaseClient()

    let query = client
      .from('ai_news')
      .select('*', { count: 'exact' })

    // 筛选条件
    if (status) {
      query = query.eq('status', status)
    }
    if (category) {
      query = query.eq('category', category)
    }
    if (authorId) {
      query = query.eq('author_id', authorId)
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%`)
    }

    // 排序
    if (sortBy === 'published_at') {
      query = query.order('published_at', { ascending: sortOrder === 'asc', nullsFirst: false })
    } else if (sortBy === 'view_count') {
      query = query.order('view_count', { ascending: sortOrder === 'asc' })
    } else if (sortBy === 'created_at') {
      query = query.order('created_at', { ascending: sortOrder === 'asc' })
    } else if (sortBy === 'is_hot' || sortBy === 'is_pinned') {
      // 使用 is_hot 字段代替 is_pinned
      query = query.order('is_hot', { ascending: false })
      query = query.order('published_at', { ascending: false })
    }

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

    return NextResponse.json({
      success: true,
      data: {
        data,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
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

// 创建AI资讯
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      slug,
      summary,
      content,
      coverImage,
      category,
      tags,
      source,
      sourceUrl,
      authorId,
    } = body

    // 验证必填字段
    if (!title || !slug || !summary || !content || !authorId) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      )
    }

    const client = getSupabaseClient()

    // 检查 slug 是否已存在
    const { data: existing } = await client
      .from('ai_news')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Slug已存在' },
        { status: 400 }
      )
    }

    // 创建资讯
    const { data, error } = await client
      .from('ai_news')
      .insert({
        title,
        slug,
        summary,
        content,
        cover_image: coverImage,
        category,
        tags,
        source,
        source_url: sourceUrl,
        author_id: authorId,
        status: 'draft',
        // 设置发布时间为当前时间（草稿状态）
        published_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('创建AI资讯错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
