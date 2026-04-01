import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 获取相关推荐工具
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const toolId = parseInt(id)
    
    if (isNaN(toolId)) {
      return NextResponse.json(
        { success: false, error: '无效的工具ID' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()

    // 先获取当前工具的信息
    const { data: currentTool, error: toolError } = await supabase
      .from('ai_tools')
      .select('id, category_id')
      .eq('id', toolId)
      .single()

    if (toolError || !currentTool) {
      return NextResponse.json(
        { success: false, error: '工具不存在' },
        { status: 404 }
      )
    }

    // 获取同分类的其他工具
    const { data: relatedTools, error } = await supabase
      .from('ai_tools')
      .select('id, name, slug, description, logo, website, is_featured, is_pinned, is_free, view_count, category_id')
      .eq('category_id', currentTool.category_id)
      .neq('id', toolId)
      .eq('status', 'approved')
      .limit(20)

    if (error) {
      console.error('获取相关工具失败:', error)
      return NextResponse.json(
        { success: false, error: '获取相关工具失败' },
        { status: 500 }
      )
    }

    let tools = relatedTools || []

    if (tools.length === 0) {
      // 如果同分类没有其他工具，则获取其他热门工具
      const { data: hotTools, error: hotError } = await supabase
        .from('ai_tools')
        .select('id, name, slug, description, logo, website, is_featured, is_pinned, is_free, view_count, category_id')
        .neq('id', toolId)
        .eq('status', 'approved')
        .order('view_count', { ascending: false })
        .limit(20)

      if (hotError || !hotTools) {
        return NextResponse.json({
          success: true,
          data: []
        })
      }
      tools = hotTools
    }

    // 获取所有涉及到的分类ID
    const categoryIds = [...new Set(tools.map(t => t.category_id).filter(Boolean))]
    
    // 批量获取分类信息
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name, slug, color')
      .in('id', categoryIds)

    const categoryMap = new Map((categories || []).map(c => [c.id, c]))

    // 组装数据
    const toolsWithCategory = tools.map(t => ({
      ...t,
      category: t.category_id ? categoryMap.get(t.category_id) || null : null
    }))

    // 对工具进行排序：置顶 > 精选 > 普通，每组内随机
    const sortedTools = sortAndRandomize(toolsWithCategory)

    return NextResponse.json({
      success: true,
      data: sortedTools.slice(0, 6)
    })
  } catch (error) {
    console.error('服务器错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 排序函数：置顶 > 精选 > 普通，每组内随机打乱
function sortAndRandomize(tools: any[]) {
  // 分组
  const pinned = tools.filter(t => t.is_pinned)
  const featured = tools.filter(t => !t.is_pinned && t.is_featured)
  const normal = tools.filter(t => !t.is_pinned && !t.is_featured)

  // Fisher-Yates 洗牌算法
  const shuffle = (arr: any[]) => {
    const result = [...arr]
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[result[i], result[j]] = [result[j], result[i]]
    }
    return result
  }

  // 返回排序结果：置顶(随机) + 精选(随机) + 普通(随机)
  return [...shuffle(pinned), ...shuffle(featured), ...shuffle(normal)]
}
