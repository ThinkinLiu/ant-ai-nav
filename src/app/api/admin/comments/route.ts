import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

/**
 * 获取所有评论列表（管理员专用）
 * 支持分页和搜索
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const client = getSupabaseClient(token)

    // 验证用户身份和管理员权限
    const { data: { user } } = await client.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: '无效的登录状态' },
        { status: 401 }
      )
    }

    const { data: userData } = await client
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userData || userData.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: '无权限访问' },
        { status: 403 }
      )
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const keyword = searchParams.get('keyword')?.trim() || ''
    const toolId = searchParams.get('toolId')

    // 分页
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = client
      .from('comments')
      .select(`
        id,
        content,
        rating,
        created_at,
        user:users!comments_user_id_fkey(id, name, avatar),
        tool:ai_tools!comments_tool_id_fkey(id, name),
        parent_id
      `, { count: 'exact' })
      .is('parent_id', null) // 只获取主评论，不包含回复
      .order('created_at', { ascending: false })

    // 按工具筛选
    if (toolId) {
      query = query.eq('tool_id', parseInt(toolId))
    }

    // 关键词搜索（搜索评论内容）
    if (keyword) {
      query = query.ilike('content', `%${keyword}%`)
    }

    const { data, error, count } = await query.range(from, to)

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    // 获取每个评论的回复数
    const commentIds = (data || []).map(c => c.id)
    let replyCounts: Record<number, number> = {}
    
    if (commentIds.length > 0) {
      const { data: replies } = await client
        .from('comments')
        .select('parent_id')
        .in('parent_id', commentIds)
      
      if (replies) {
        replies.forEach(r => {
          if (r.parent_id) {
            replyCounts[r.parent_id] = (replyCounts[r.parent_id] || 0) + 1
          }
        })
      }
    }

    // 如果有搜索关键词，还需要按用户名过滤
    let filteredData = data || []
    if (keyword && filteredData.length > 0) {
      // 搜索用户名匹配的评论
      const { data: matchedUsers } = await client
        .from('users')
        .select('id')
        .ilike('name', `%${keyword}%`)
      
      const matchedUserIds = new Set(matchedUsers?.map(u => u.id) || [])
      
      // 合并内容匹配和用户名匹配的结果
      const { data: userComments } = await client
        .from('comments')
        .select(`
          id,
          content,
          rating,
          created_at,
          user:users!comments_user_id_fkey(id, name, avatar),
          tool:ai_tools!comments_tool_id_fkey(id, name),
          parent_id
        `)
        .in('user_id', Array.from(matchedUserIds))
        .is('parent_id', null)
        .order('created_at', { ascending: false })
        .range(from, to)
      
      if (userComments && userComments.length > 0) {
        // 合并去重
        const existingIds = new Set(filteredData.map(c => c.id))
        for (const uc of userComments) {
          if (!existingIds.has(uc.id)) {
            filteredData.push(uc)
          }
        }
        // 按时间排序
        filteredData.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      }
    }

    // 组装数据
    const comments = filteredData.map(comment => ({
      ...comment,
      reply_count: replyCounts[comment.id] || 0
    }))

    // 重新计算总数（如果有搜索）
    let total = count || 0
    if (keyword) {
      // 获取搜索后的真实总数
      const { count: searchCount } = await client
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .is('parent_id', null)
        .or(`content.ilike.%${keyword}%`)
      
      total = searchCount || 0
    }

    return NextResponse.json({
      success: true,
      data: {
        data: comments,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize)
        }
      }
    })
  } catch (error) {
    console.error('获取评论列表错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
