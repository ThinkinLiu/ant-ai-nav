import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

interface Props {
  params: Promise<{ id: string }>
}

/**
 * 获取单个标签
 */
export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params
    const supabase = getSupabaseClient()
    
    const { data: tag, error } = await supabase
      .from('tags')
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
      data: tag,
    })
  } catch (error) {
    console.error('获取标签失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

/**
 * 更新标签
 */
export async function PUT(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params
    const supabase = getSupabaseClient()
    const body = await request.json()
    
    const { name, slug } = body
    
    // 验证必填字段
    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: '名称和标识为必填项' },
        { status: 400 }
      )
    }
    
    // 检查标签是否存在
    const { data: existingTag, error: fetchError } = await supabase
      .from('tags')
      .select('*')
      .eq('id', parseInt(id))
      .single()
    
    if (fetchError || !existingTag) {
      return NextResponse.json(
        { success: false, error: '标签不存在' },
        { status: 404 }
      )
    }
    
    // 检查slug是否被其他标签使用
    const { data: slugConflict } = await supabase
      .from('tags')
      .select('id')
      .eq('slug', slug)
      .neq('id', parseInt(id))
      .single()
    
    if (slugConflict) {
      return NextResponse.json(
        { success: false, error: '标识已被其他标签使用' },
        { status: 400 }
      )
    }
    
    // 检查名称是否被其他标签使用
    const { data: nameConflict } = await supabase
      .from('tags')
      .select('id')
      .eq('name', name)
      .neq('id', parseInt(id))
      .single()
    
    if (nameConflict) {
      return NextResponse.json(
        { success: false, error: '名称已被其他标签使用' },
        { status: 400 }
      )
    }
    
    const { data: tag, error } = await supabase
      .from('tags')
      .update({ name, slug })
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
      data: tag,
    })
  } catch (error) {
    console.error('更新标签失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

/**
 * 删除标签
 */
export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params
    const supabase = getSupabaseClient()
    
    // 检查标签是否存在
    const { data: existingTag, error: fetchError } = await supabase
      .from('tags')
      .select('*')
      .eq('id', parseInt(id))
      .single()
    
    if (fetchError || !existingTag) {
      return NextResponse.json(
        { success: false, error: '标签不存在' },
        { status: 404 }
      )
    }
    
    // 删除标签与工具的关联
    await supabase
      .from('tool_tags')
      .delete()
      .eq('tag_id', parseInt(id))
    
    // 删除标签
    const { error } = await supabase
      .from('tags')
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
    console.error('删除标签失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
