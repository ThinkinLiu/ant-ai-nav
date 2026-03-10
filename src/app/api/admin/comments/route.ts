import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

/**
 * 获取所有评论列表（管理员专用）
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
    const toolId = searchParams.get('toolId')

    // 构建查询
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

    if (toolId) {
      query = query.eq('tool_id', parseInt(toolId))
    }

    // 分页
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

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

    // 组装数据
    const comments = (data || []).map(comment => ({
      ...comment,
      reply_count: replyCounts[comment.id] || 0
    }))

    return NextResponse.json({
      success: true,
      data: {
        data: comments,
        pagination: {
          page,
          pageSize,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / pageSize)
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
