import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 获取菜单配置
export async function GET(request: NextRequest) {
  const supabase = getSupabaseClient()
  const searchParams = request.nextUrl.searchParams
  const menuType = searchParams.get('menuType') || 'site'

  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('menu_type', menuType)
    .order('sort_order', { ascending: true })

  if (error) {
    return NextResponse.json(
      { error: '获取菜单配置失败' },
      { status: 500 }
    )
  }

  return NextResponse.json({ data: data || [] })
}

// 批量更新菜单配置
export async function PUT(request: NextRequest) {
  const supabase = getSupabaseClient()
  const body = await request.json()
  const { menuType, items } = body

  if (!menuType || !Array.isArray(items)) {
    return NextResponse.json(
      { error: '参数错误' },
      { status: 400 }
    )
  }

  try {
    // 开启事务
    const { data: existingData, error: fetchError } = await supabase
      .from('menu_items')
      .select('id')
      .eq('menu_type', menuType)

    if (fetchError) {
      throw fetchError
    }

    const existingIds = new Set(existingData?.map(item => item.id) || [])
    const newIds = new Set(items.filter(item => item.id).map(item => item.id))

    // 删除不在新列表中的项目（只删除非默认菜单）
    const toDelete = [...existingIds].filter(id => !newIds.has(id))
    if (toDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('menu_items')
        .delete()
        .in('id', toDelete)
        .eq('is_default', false)

      if (deleteError) {
        throw deleteError
      }
    }

    // 更新或插入菜单项
    for (const item of items) {
      if (item.id) {
        // 更新现有项目
        const { error: updateError } = await supabase
          .from('menu_items')
          .update({
            label: item.label,
            url: item.url,
            icon: item.icon,
            sort_order: item.sort_order,
            is_active: item.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.id)
          .eq('menu_type', menuType)

        if (updateError) {
          throw updateError
        }
      } else {
        // 插入新项目
        const { error: insertError } = await supabase
          .from('menu_items')
          .insert({
            menu_type: menuType,
            label: item.label,
            url: item.url,
            icon: item.icon,
            sort_order: item.sort_order,
            is_active: item.is_active,
            is_default: false
          })

        if (insertError) {
          throw insertError
        }
      }
    }

    // 获取更新后的数据
    const { data: updatedData, error: fetchUpdatedError } = await supabase
      .from('menu_items')
      .select('*')
      .eq('menu_type', menuType)
      .order('sort_order', { ascending: true })

    if (fetchUpdatedError) {
      throw fetchUpdatedError
    }

    return NextResponse.json({ data: updatedData })
  } catch (error) {
    console.error('更新菜单配置失败:', error)
    return NextResponse.json(
      { error: '更新菜单配置失败' },
      { status: 500 }
    )
  }
}

// 添加新菜单项
export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient()
  const body = await request.json()
  const { menuType, label, url, icon, sort_order } = body

  if (!menuType || !label || !url) {
    return NextResponse.json(
      { error: '参数错误' },
      { status: 400 }
    )
  }

  // 获取当前最大排序
  const { data: maxSortData } = await supabase
    .from('menu_items')
    .select('sort_order')
    .eq('menu_type', menuType)
    .order('sort_order', { ascending: false })
    .limit(1)

  const nextSortOrder = sort_order || (maxSortData && maxSortData[0] ? maxSortData[0].sort_order + 1 : 1)

  const { data, error } = await supabase
    .from('menu_items')
    .insert({
      menu_type: menuType,
      label,
      url,
      icon: icon || null,
      sort_order: nextSortOrder,
      is_active: true,
      is_default: false
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json(
      { error: '添加菜单项失败' },
      { status: 500 }
    )
  }

  return NextResponse.json({ data })
}

// 删除菜单项
export async function DELETE(request: NextRequest) {
  const supabase = getSupabaseClient()
  const searchParams = request.nextUrl.searchParams
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json(
      { error: '参数错误' },
      { status: 400 }
    )
  }

  // 检查是否为默认菜单项
  const { data: menuItem } = await supabase
    .from('menu_items')
    .select('is_default')
    .eq('id', parseInt(id))
    .single()

  if (menuItem?.is_default) {
    return NextResponse.json(
      { error: '默认菜单项不可删除' },
      { status: 400 }
    )
  }

  const { error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', parseInt(id))

  if (error) {
    return NextResponse.json(
      { error: '删除菜单项失败' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
