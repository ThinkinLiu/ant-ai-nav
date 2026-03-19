import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

/**
 * 获取工具列表（管理员专用）
 * 支持筛选、排序、分页
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: '请先登录' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const client = getSupabaseClient(token)

    const { data: { user } } = await client.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, error: '无效的登录状态' }, { status: 401 })
    }

    const { data: userData } = await client
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'admin') {
      return NextResponse.json({ success: false, error: '无权限' }, { status: 403 })
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || ''
    const categoryId = searchParams.get('categoryId') || ''
    const publisherId = searchParams.get('publisherId') || ''
    const keyword = searchParams.get('keyword') || ''
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')

    // 构建基础查询
    let query = client
      .from('ai_tools')
      .select('*', { count: 'exact' })

    // 筛选条件
    if (status) {
      query = query.eq('status', status)
    }
    if (categoryId) {
      query = query.eq('category_id', parseInt(categoryId))
    }
    if (publisherId) {
      query = query.eq('publisher_id', publisherId)
    }
    if (keyword) {
      query = query.or(`name.ilike.%${keyword}%,description.ilike.%${keyword}%`)
    }

    // 分页
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    // 排序 - 先按置顶排序，再按指定字段排序
    const ascending = sortOrder === 'asc'
    query = query.order('is_pinned', { ascending: false })
    query = query.order(sortBy, { ascending })

    const { data: tools, error, count } = await query.range(from, to)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    // 获取分类信息
    const categoryIds = [...new Set(tools?.map(t => t.category_id).filter(Boolean) || [])]
    const { data: categories } = categoryIds.length > 0 
      ? await client.from('categories').select('id, name').in('id', categoryIds)
      : { data: [] }

    // 获取发布者信息
    const publisherIds = [...new Set(tools?.map(t => t.publisher_id).filter(Boolean) || [])]
    const { data: publishers } = publisherIds.length > 0
      ? await client.from('users').select('id, name, email, avatar').in('id', publisherIds)
      : { data: [] }

    // 获取工具ID列表
    const toolIds = tools?.map(t => t.id) || []

    // 获取评论数统计
    let commentCounts: Record<number, number> = {}
    if (toolIds.length > 0) {
      const { data: comments } = await client
        .from('comments')
        .select('tool_id')
        .in('tool_id', toolIds)
        .is('parent_id', null)
      
      if (comments) {
        comments.forEach(c => {
          commentCounts[c.tool_id] = (commentCounts[c.tool_id] || 0) + 1
        })
      }
    }

    // 获取标签 - 使用直接查询方式
    let toolTagsMap: Record<number, { id: number; name: string }[]> = {}
    if (toolIds.length > 0) {
      const { data: toolTags } = await client
        .from('tool_tags')
        .select('tool_id, tag_id')
        .in('tool_id', toolIds)
      
      if (toolTags && toolTags.length > 0) {
        const tagIds = [...new Set(toolTags.map(tt => tt.tag_id))]
        const { data: tagsData } = await client
          .from('tags')
          .select('id, name')
          .in('id', tagIds)
        
        const tagMap = new Map((tagsData || []).map(t => [t.id, t]))
        
        toolTags.forEach((tt: any) => {
          if (!toolTagsMap[tt.tool_id]) {
            toolTagsMap[tt.tool_id] = []
          }
          const tag = tagMap.get(tt.tag_id)
          if (tag) {
            toolTagsMap[tt.tool_id].push(tag)
          }
        })
      }
    }

    // 组装数据
    const toolsWithInfo = (tools || []).map(tool => ({
      ...tool,
      category: categories?.find(c => c.id === tool.category_id) || null,
      publisher: publishers?.find(p => p.id === tool.publisher_id) || null,
      comment_count: commentCounts[tool.id] || 0,
      tags: toolTagsMap[tool.id] || [],
    }))

    // 获取所有分类（用于筛选下拉）
    const { data: allCategories } = await client
      .from('categories')
      .select('id, name')
      .order('name')

    // 获取所有发布者（用于筛选下拉）
    const { data: allPublishers } = await client
      .from('users')
      .select('id, name, email')
      .in('role', ['publisher', 'admin'])
      .order('name')

    return NextResponse.json({
      success: true,
      data: {
        data: toolsWithInfo,
        pagination: {
          page,
          pageSize,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / pageSize)
        },
        filters: {
          categories: allCategories || [],
          publishers: allPublishers || []
        }
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    })
  } catch (error) {
    console.error('获取工具列表错误:', error)
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 })
  }
}
