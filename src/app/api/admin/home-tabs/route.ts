import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

/**
 * 获取所有首页Tab配置
 */
export async function GET() {
  try {
    const supabase = getSupabaseClient()
    
    const { data: tabs, error } = await supabase
      .from('home_tabs')
      .select('*')
      .order('sort_order', { ascending: true })
    
    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: tabs,
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
 * 创建新的Tab配置
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const body = await request.json()
    
    const { name, slug, type, source_id, icon, color, sort_order, is_default, is_visible } = body
    
    // 验证必填字段
    if (!name || !slug || !type) {
      return NextResponse.json(
        { success: false, error: '名称、标识和类型为必填项' },
        { status: 400 }
      )
    }
    
    // 验证类型
    const validTypes = [
      'hot_tools', 'domestic_tools', 'foreign_tools', 'lobster_tools',
      'category', 'tag', 'news', 'fame', 'timeline', 'ranking'
    ]
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: '无效的类型' },
        { status: 400 }
      )
    }
    
    // 检查slug是否已存在
    const { data: existingTab } = await supabase
      .from('home_tabs')
      .select('id')
      .eq('slug', slug)
      .single()
    
    if (existingTab) {
      return NextResponse.json(
        { success: false, error: '标识已存在' },
        { status: 400 }
      )
    }
    
    // 如果设置为默认，先取消其他默认
    if (is_default) {
      await supabase
        .from('home_tabs')
        .update({ is_default: false })
        .eq('is_default', true)
    }
    
    const { data: tab, error } = await supabase
      .from('home_tabs')
      .insert({
        name,
        slug,
        type,
        source_id: source_id || null,
        icon: icon || null,
        color: color || null,
        sort_order: sort_order || 0,
        is_default: is_default || false,
        is_visible: is_visible !== undefined ? is_visible : true,
        is_system: false,
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
      data: tab,
    })
  } catch (error) {
    console.error('创建Tab配置失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
