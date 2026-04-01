import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 默认分类的 ID 范围（不可删除）
const DEFAULT_CATEGORY_IDS = [1, 2, 3, 4, 5, 6, 7, 8]

// 获取分类列表
export async function GET() {
  try {
    const client = getSupabaseClient()
    
    // 获取分类列表
    const { data: categories, error } = await client
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    // 获取每个分类的工具数量
    const { data: toolsCount } = await client
      .from('ai_tools')
      .select('category_id')

    const countMap = new Map<number, number>()
    if (toolsCount) {
      for (const tool of toolsCount) {
        const count = countMap.get(tool.category_id) || 0
        countMap.set(tool.category_id, count + 1)
      }
    }

    // 组装数据
    const categoriesWithMeta = (categories || []).map(category => ({
      ...category,
      toolCount: countMap.get(category.id) || 0,
      is_default: DEFAULT_CATEGORY_IDS.includes(category.id),
    }))

    return NextResponse.json({
      success: true,
      data: categoriesWithMeta,
    })
  } catch (error) {
    console.error('获取分类错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 创建新分类
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, slug, description, icon, color, sort_order } = body

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: '名称和标识不能为空' },
        { status: 400 }
      )
    }

    const client = getSupabaseClient()

    // 检查 slug 是否已存在
    const { data: existing } = await client
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existing) {
      return NextResponse.json(
        { success: false, error: '该标识已存在' },
        { status: 400 }
      )
    }

    // 创建分类
    const { data, error } = await client
      .from('categories')
      .insert({
        name,
        slug,
        description: description || null,
        icon: icon || null,
        color: color || '6366F1',
        sort_order: sort_order || 0,
        is_active: true,
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
      data: { ...data, toolCount: 0, is_default: false },
    })
  } catch (error) {
    console.error('创建分类错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 更新分类
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

    const client = getSupabaseClient()

    // 检查 slug 是否与其他分类冲突
    if (slug) {
      const { data: existing } = await client
        .from('categories')
        .select('id')
        .eq('slug', slug)
        .neq('id', id)
        .single()

      if (existing) {
        return NextResponse.json(
          { success: false, error: '该标识已被其他分类使用' },
          { status: 400 }
        )
      }
    }

    // 更新分类
    const updateData: Record<string, any> = {}
    if (name !== undefined) updateData.name = name
    if (slug !== undefined) updateData.slug = slug
    if (description !== undefined) updateData.description = description
    if (icon !== undefined) updateData.icon = icon
    if (color !== undefined) updateData.color = color
    if (sort_order !== undefined) updateData.sort_order = sort_order
    if (is_active !== undefined) updateData.is_active = is_active

    const { data, error } = await client
      .from('categories')
      .update(updateData)
      .eq('id', id)
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
      data: { ...data, is_default: DEFAULT_CATEGORY_IDS.includes(id) },
    })
  } catch (error) {
    console.error('更新分类错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 删除分类
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = parseInt(searchParams.get('id') || '')

    if (!id) {
      return NextResponse.json(
        { success: false, error: '分类ID不能为空' },
        { status: 400 }
      )
    }

    // 检查是否为默认分类
    if (DEFAULT_CATEGORY_IDS.includes(id)) {
      return NextResponse.json(
        { success: false, error: '默认分类不能删除' },
        { status: 400 }
      )
    }

    const client = getSupabaseClient()

    // 检查是否有工具使用该分类
    const { data: tools } = await client
      .from('ai_tools')
      .select('id')
      .eq('category_id', id)
      .limit(1)

    if (tools && tools.length > 0) {
      return NextResponse.json(
        { success: false, error: '该分类下还有工具，无法删除' },
        { status: 400 }
      )
    }

    // 删除分类
    const { error } = await client
      .from('categories')
      .delete()
      .eq('id', id)

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
    console.error('删除分类错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
