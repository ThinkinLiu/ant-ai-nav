import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

/**
 * 获取所有标签（带工具数量和资讯数量统计）
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const authHeader = request.headers.get('authorization')
    
    // 验证管理员权限
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: '未授权' },
        { status: 401 }
      )
    }
    
    // 获取所有标签
    const { data: tags, error } = await supabase
      .from('tags')
      .select('*')
      .order('name', { ascending: true })
    
    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }
    
    // 获取每个标签的工具数量
    const { data: toolCounts } = await supabase
      .rpc('get_tool_counts_by_tag')
    
    const toolCountMap = new Map<number, number>()
    if (toolCounts) {
      for (const item of toolCounts) {
        toolCountMap.set(item.tag_id, item.count)
      }
    }
    
    // 获取每个标签的资讯数量
    const { data: newsCounts } = await supabase
      .from('news_tags')
      .select('tag_id')
    
    const newsCountMap = new Map<number, number>()
    if (newsCounts) {
      for (const item of newsCounts) {
        const count = newsCountMap.get(item.tag_id) || 0
        newsCountMap.set(item.tag_id, count + 1)
      }
    }
    
    // 组装数据
    const tagsWithCount = (tags || []).map(tag => ({
      ...tag,
      toolCount: toolCountMap.get(tag.id) || 0,
      newsCount: newsCountMap.get(tag.id) || 0,
    }))
    
    return NextResponse.json({
      success: true,
      data: tagsWithCount,
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
 * 创建新标签
 */
export async function POST(request: NextRequest) {
  try {
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
    
    // 检查slug是否已存在
    const { data: existingTag } = await supabase
      .from('tags')
      .select('id')
      .eq('slug', slug)
      .single()
    
    if (existingTag) {
      return NextResponse.json(
        { success: false, error: '标识已存在' },
        { status: 400 }
      )
    }
    
    // 检查名称是否已存在
    const { data: existingName } = await supabase
      .from('tags')
      .select('id')
      .eq('name', name)
      .single()
    
    if (existingName) {
      return NextResponse.json(
        { success: false, error: '标签名称已存在' },
        { status: 400 }
      )
    }
    
    const { data: tag, error } = await supabase
      .from('tags')
      .insert({
        name,
        slug,
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
      data: tag,
    })
  } catch (error) {
    console.error('创建标签失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
