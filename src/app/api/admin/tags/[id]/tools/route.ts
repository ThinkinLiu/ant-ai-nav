import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

interface Props {
  params: Promise<{ id: string }>
}

/**
 * 获取标签关联的工具列表
 */
export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: '未授权' },
        { status: 401 }
      )
    }
    
    const supabase = getSupabaseClient()
    
    // 获取标签关联的工具ID
    const { data: toolTags, error: toolTagsError } = await supabase
      .from('tool_tags')
      .select('tool_id')
      .eq('tag_id', parseInt(id))
    
    if (toolTagsError) {
      return NextResponse.json(
        { success: false, error: toolTagsError.message },
        { status: 400 }
      )
    }
    
    if (!toolTags || toolTags.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      })
    }
    
    const toolIds = toolTags.map(tt => tt.tool_id)
    
    // 获取工具详情
    const { data: tools, error: toolsError } = await supabase
      .from('ai_tools')
      .select('id, name, slug, description, website, logo, status, view_count, favorite_count, created_at, category_id')
      .in('id', toolIds)
      .order('created_at', { ascending: false })
    
    if (toolsError) {
      return NextResponse.json(
        { success: false, error: toolsError.message },
        { status: 400 }
      )
    }
    
    // 获取分类信息
    const categoryIds = [...new Set((tools || []).map(t => t.category_id).filter(Boolean))]
    const { data: categories } = categoryIds.length > 0
      ? await supabase
          .from('categories')
          .select('id, name, color')
          .in('id', categoryIds)
      : { data: [] }
    
    const categoryMap = new Map((categories || []).map(c => [c.id, c]))
    
    // 组装数据
    const toolsWithCategory = (tools || []).map(tool => ({
      ...tool,
      category: categoryMap.get(tool.category_id) || null,
    }))
    
    return NextResponse.json({
      success: true,
      data: toolsWithCategory,
    })
  } catch (error) {
    console.error('获取标签关联工具失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
