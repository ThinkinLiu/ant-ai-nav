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
    const hot = searchParams.get('hot') === 'true'
    const sortBy = searchParams.get('sortBy') || 'published_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const client = getSupabaseClient()

    // 获取分类配置
    const { data: categories } = await client
      .from('news_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    // 创建分类映射：slug -> { name, color }
    // 过滤掉"博客日志"分类
    const categoryMap: Record<string, { name: string; color: string }> = {}
    categories?.forEach(cat => {
      if (cat.name !== '博客日志') {
        categoryMap[cat.slug] = {
          name: cat.name,
          color: cat.color
        }
      }
    })

    let query = client
      .from('ai_news')
      .select('*', { count: 'exact' })

    // 筛选条件
    if (status) {
      query = query.eq('status', status)
    }
    if (category) {
      // 使用 like 查询匹配 JSON 数组中的分类
      query = query.like('category', `%${category}%`)
    }
    if (authorId) {
      query = query.eq('author_id', authorId)
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%`)
    }
    if (hot) {
      query = query.eq('is_hot', true)
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

    // 解析 category 字段为数组
    const parsedData = data.map(item => {
      let parsedCategory = item.category
      try {
        if (item.category && typeof item.category === 'string') {
          const parsed = JSON.parse(item.category)
          if (Array.isArray(parsed)) {
            parsedCategory = parsed
          }
        }
      } catch (e) {
        // 如果解析失败，保持原值
        parsedCategory = item.category
      }

      // 确保 tags 是数组
      let parsedTags = item.tags
      if (!parsedTags) {
        parsedTags = []
      } else if (typeof parsedTags === 'string') {
        try {
          parsedTags = JSON.parse(parsedTags)
        } catch (e) {
          parsedTags = []
        }
      }

      return {
        ...item,
        category: parsedCategory,
        tags: parsedTags,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        data: parsedData,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
        categories: categoryMap,
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
      categories,
      tags,
      source,
      sourceUrl,
      authorId,
      publishedAt,
      relatedTools,
      isFeatured,
      isHot,
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

    // 处理分类：支持多选（JSON数组）或单选（字符串）
    let categoryValue: string
    if (categories && Array.isArray(categories) && categories.length > 0) {
      categoryValue = JSON.stringify(categories)
    } else if (category) {
      categoryValue = JSON.stringify([category])
    } else {
      categoryValue = JSON.stringify([])
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
        category: categoryValue,
        tags,
        source,
        source_url: sourceUrl,
        author_id: authorId,
        status: 'draft',
        is_featured: isFeatured || false,
        is_hot: isHot || false,
        related_tools: relatedTools || [],
        // 使用自定义发布时间或当前时间
        published_at: publishedAt || new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    // 解析 category 字段返回
    let parsedCategory: string | string[] = categoryValue
    try {
      if (categoryValue) {
        const parsed = JSON.parse(categoryValue)
        if (Array.isArray(parsed)) {
          parsedCategory = parsed
        }
      }
    } catch (e) {
      // 如果解析失败，保持原值
      parsedCategory = categoryValue
    }

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        category: parsedCategory,
      },
    })
  } catch (error) {
    console.error('创建AI资讯错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
