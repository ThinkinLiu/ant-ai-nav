import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

interface Props {
  params: Promise<{ id: string }>
}

/**
 * 获取单个Tab配置
 */
export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params
    const supabase = getSupabaseClient()
    
    const { data: tab, error } = await supabase
      .from('home_tabs')
      .select('*')
      .eq('id', parseInt(id))
      .single()
    
    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: tab,
    })
  } catch (error) {
    console.error('获取Tab配置失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

/**
 * 更新Tab配置
 */
export async function PUT(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params
    const supabase = getSupabaseClient()
    const body = await request.json()
    
    const { name, slug, type, source_id, icon, color, sort_order, is_default, is_visible } = body
    
    // 检查Tab是否存在
    const { data: existingTab, error: fetchError } = await supabase
      .from('home_tabs')
      .select('*')
      .eq('id', parseInt(id))
      .single()
    
    if (fetchError || !existingTab) {
      return NextResponse.json(
        { success: false, error: 'Tab不存在' },
        { status: 404 }
      )
    }
    
    // 系统Tab不能修改类型
    const updateData: any = {
      name,
      icon: icon || null,
      color: color || null,
      sort_order: sort_order ?? existingTab.sort_order,
      is_visible: is_visible !== undefined ? is_visible : existingTab.is_visible,
    }
    
    // 非系统Tab可以修改slug和type
    if (!existingTab.is_system) {
      updateData.slug = slug
      updateData.type = type
      updateData.source_id = source_id || null
    }
    
    // 如果设置为默认，先取消其他默认
    if (is_default) {
      await supabase
        .from('home_tabs')
        .update({ is_default: false })
        .neq('id', parseInt(id))
      updateData.is_default = true
    } else {
      updateData.is_default = false
    }
    
    const { data: tab, error } = await supabase
      .from('home_tabs')
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
    
    return NextResponse.json({
      success: true,
      data: tab,
    })
  } catch (error) {
    console.error('更新Tab配置失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

/**
 * 删除Tab配置
 */
export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params
    const supabase = getSupabaseClient()
    
    // 检查Tab是否存在
    const { data: existingTab, error: fetchError } = await supabase
      .from('home_tabs')
      .select('*')
      .eq('id', parseInt(id))
      .single()
    
    if (fetchError || !existingTab) {
      return NextResponse.json(
        { success: false, error: 'Tab不存在' },
        { status: 404 }
      )
    }
    
    // 系统Tab不能删除
    if (existingTab.is_system) {
      return NextResponse.json(
        { success: false, error: '系统默认Tab不能删除' },
        { status: 400 }
      )
    }
    
    const { error } = await supabase
      .from('home_tabs')
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
    console.error('删除Tab配置失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
