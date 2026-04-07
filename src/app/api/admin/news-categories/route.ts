import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 获取资讯分类列表
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient()

    // 获取所有分类，并统计每个分类下的资讯数量
    const { data: categories, error } = await client
      .from('news_categories')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    // 获取每个分类下的资讯数量
    const { data: newsData } = await client
      .from('ai_news')
      .select('category')

    const countMap = new Map<string, number>()
    if (newsData) {
      for (const news of newsData) {
        if (news.category) {
          // 处理 category 字段可能是 JSON 数组或单个字符串的情况
          let categories: string[] = []
          try {
            // 尝试解析为 JSON 数组
            const parsed = JSON.parse(news.category as string)
            if (Array.isArray(parsed)) {
              categories = parsed
            } else {
              categories = [parsed]
            }
          } catch {
            // 解析失败，当作单个字符串处理
            categories = [news.category as string]
          }

          // 统计每个分类的数量
          for (const cat of categories) {
            const count = countMap.get(cat) || 0
            countMap.set(cat, count + 1)
          }
        }
      }
    }

    // 组装数据
    const result = (categories || []).map(cat => ({
      ...cat,
      newsCount: countMap.get(cat.slug) || 0,
    }))

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('获取资讯分类列表错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 创建资讯分类
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, slug, description, icon, color, sort_order, is_active } = body

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: '名称和标识不能为空' },
        { status: 400 }
      )
    }

    // 验证 slug 格式
    const slugPattern = /^[a-z0-9-]+$/
    if (!slugPattern.test(slug)) {
      return NextResponse.json(
        { success: false, error: '标识只能包含小写字母、数字和连字符' },
        { status: 400 }
      )
    }

    const client = getSupabaseClient()

    // 检查 slug 是否已存在
    const { data: existing } = await client
      .from('news_categories')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existing) {
      return NextResponse.json(
        { success: false, error: '标识已存在' },
        { status: 400 }
      )
    }

    const { data, error } = await client
      .from('news_categories')
      .insert({
        name,
        slug,
        description: description || null,
        icon: icon || null,
        color: color || '#6366F1',
        sort_order: sort_order || 0,
        is_active: is_active ?? true,
        is_default: false,
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
      data: { ...data, newsCount: 0 },
    })
  } catch (error) {
    console.error('创建资讯分类错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 更新资讯分类
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, slug, description, icon, color, sort_order, is_active } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: '分类ID不能为空' },
        { status: 400 }
      )
    }

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: '名称和标识不能为空' },
        { status: 400 }
      )
    }

    // 验证 slug 格式
    const slugPattern = /^[a-z0-9-]+$/
    if (!slugPattern.test(slug)) {
      return NextResponse.json(
        { success: false, error: '标识只能包含小写字母、数字和连字符' },
        { status: 400 }
      )
    }

    const client = getSupabaseClient()

    // 检查分类是否存在
    const { data: existing } = await client
      .from('news_categories')
      .select('id, slug, is_default')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json(
        { success: false, error: '分类不存在' },
        { status: 404 }
      )
    }

    // 如果修改了 slug，检查是否与其他分类重复
    if (slug !== existing.slug) {
      const { data: duplicate } = await client
        .from('news_categories')
        .select('id')
        .eq('slug', slug)
        .neq('id', id)
        .single()

      if (duplicate) {
        return NextResponse.json(
          { success: false, error: '标识已存在' },
          { status: 400 }
        )
      }

      // 如果修改了 slug，需要更新所有使用该分类的资讯
      await client
        .from('ai_news')
        .update({ category: slug })
        .eq('category', existing.slug)
    }

    // 更新分类
    const { data, error } = await client
      .from('news_categories')
      .update({
        name,
        slug,
        description: description || null,
        icon: icon || null,
        color: color || '#6366F1',
        sort_order: sort_order || 0,
        is_active: is_active ?? true,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    // 获取资讯数量
    const { count } = await client
      .from('ai_news')
      .select('*', { count: 'exact', head: true })
      .eq('category', slug)

    return NextResponse.json({
      success: true,
      data: { ...data, newsCount: count || 0 },
    })
  } catch (error) {
    console.error('更新资讯分类错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 删除资讯分类
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: '分类ID不能为空' },
        { status: 400 }
      )
    }

    const client = getSupabaseClient()

    // 检查分类是否存在
    const { data: existing } = await client
      .from('news_categories')
      .select('id, slug, is_default')
      .eq('id', parseInt(id))
      .single()

    if (!existing) {
      return NextResponse.json(
        { success: false, error: '分类不存在' },
        { status: 404 }
      )
    }

    // 默认分类不能删除
    if (existing.is_default) {
      return NextResponse.json(
        { success: false, error: '默认分类不能删除' },
        { status: 400 }
      )
    }

    // 检查是否有资讯使用该分类
    const { count } = await client
      .from('ai_news')
      .select('*', { count: 'exact', head: true })
      .eq('category', existing.slug)

    if (count && count > 0) {
      return NextResponse.json(
        { success: false, error: '该分类下还有资讯，无法删除' },
        { status: 400 }
      )
    }

    // 删除分类
    const { error } = await client
      .from('news_categories')
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
    console.error('删除资讯分类错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
