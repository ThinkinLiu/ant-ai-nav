import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 获取AI资讯详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const client = getSupabaseClient()

    const { data: news, error } = await client
      .from('ai_news')
      .select('*')
      .eq('id', parseInt(id))
      .single()

    if (error || !news) {
      return NextResponse.json(
        { success: false, error: '资讯不存在' },
        { status: 404 }
      )
    }

    // 增加浏览量
    await client
      .from('ai_news')
      .update({ view_count: (news.view_count || 0) + 1 })
      .eq('id', news.id)

    // 解析 category 字段（可能为 JSON 数组或字符串）
    let parsedCategory = news.category
    try {
      if (news.category && typeof news.category === 'string') {
        const parsed = JSON.parse(news.category)
        if (Array.isArray(parsed)) {
          parsedCategory = parsed
        }
      }
    } catch (e) {
      // 如果解析失败，保持原值
      parsedCategory = news.category
    }

    return NextResponse.json({
      success: true,
      data: {
        ...news,
        category: parsedCategory,
        view_count: (news.view_count || 0) + 1,
      },
    })
  } catch (error) {
    console.error('获取AI资讯详情错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 更新AI资讯
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const client = getSupabaseClient()

    // 检查资讯是否存在
    const { data: existing } = await client
      .from('ai_news')
      .select('id, slug')
      .eq('id', parseInt(id))
      .single()

    if (!existing) {
      return NextResponse.json(
        { success: false, error: '资讯不存在' },
        { status: 404 }
      )
    }

    // 如果修改了 slug，检查是否重复
    if (body.slug && body.slug !== existing.slug) {
      const { data: duplicateSlug } = await client
        .from('ai_news')
        .select('id')
        .eq('slug', body.slug)
        .neq('id', parseInt(id))
        .single()

      if (duplicateSlug) {
        return NextResponse.json(
          { success: false, error: 'Slug已存在' },
          { status: 400 }
        )
      }
    }

    // 构建更新对象
    const updateData: any = {}
    const allowedFields = [
      'title', 'slug', 'summary', 'content', 'coverImage', 'category',
      'categories', 'tags', 'source', 'sourceUrl', 'isFeatured', 'isHot', 'publishedAt'
    ]

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        // 特殊处理 categories 字段
        if (field === 'categories') {
          // 将 categories 数组转为 JSON 字符串存储
          if (Array.isArray(body.categories) && body.categories.length > 0) {
            updateData.category = JSON.stringify(body.categories)
          } else {
            updateData.category = JSON.stringify([])
          }
        } else if (field === 'category') {
          // 兼容旧的 category 字段，转为数组格式
          updateData.category = JSON.stringify([body.category])
        } else {
          // 转换字段名为下划线格式
          const dbField = field.replace(/([A-Z])/g, '_$1').toLowerCase()
          updateData[dbField] = body[field]
        }
      }
    })

    updateData.updated_at = new Date().toISOString()

    // 更新资讯
    const { data, error } = await client
      .from('ai_news')
      .update(updateData)
      .eq('id', parseInt(id))
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    // 解析 category 字段返回
    let parsedCategory = data.category
    try {
      if (data.category && typeof data.category === 'string') {
        const parsed = JSON.parse(data.category)
        if (Array.isArray(parsed)) {
          parsedCategory = parsed
        }
      }
    } catch (e) {
      // 如果解析失败，保持原值
      parsedCategory = data.category
    }

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        category: parsedCategory,
      },
    })
  } catch (error) {
    console.error('更新AI资讯错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 删除AI资讯
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const client = getSupabaseClient()

    // 检查资讯是否存在
    const { data: existing } = await client
      .from('ai_news')
      .select('id')
      .eq('id', parseInt(id))
      .single()

    if (!existing) {
      return NextResponse.json(
        { success: false, error: '资讯不存在' },
        { status: 404 }
      )
    }

    // 删除资讯
    const { error } = await client
      .from('ai_news')
      .delete()
      .eq('id', parseInt(id))

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '删除成功',
    })
  } catch (error) {
    console.error('删除AI资讯错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
