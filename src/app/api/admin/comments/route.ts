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

    // 构建基础查询 - 只获取主评论
    let query = client
      .from('comments')
      .select('id, content, rating, created_at, parent_id, user_id, tool_id, is_featured', { count: 'exact' })
      .is('parent_id', null)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })

    // 按工具筛选
    if (toolId) {
      query = query.eq('tool_id', parseInt(toolId))
    }

    // 关键词搜索
    if (keyword) {
      query = query.ilike('content', `%${keyword}%`)
    }

    const { data, error, count } = await query.range(from, to)

    if (error) {
      console.error('查询评论错误:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    // 如果没有数据，直接返回空结果
    if (!data || data.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          data: [],
          pagination: {
            page,
            pageSize,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / pageSize)
          }
        }
      })
    }

    // 获取用户信息
    const userIds = [...new Set(data.map(c => c.user_id))]
    const { data: users } = await client
      .from('users')
      .select('id, name, avatar')
      .in('id', userIds)

    // 获取工具信息
    const toolIds = [...new Set(data.map(c => c.tool_id))]
    const { data: tools } = await client
      .from('ai_tools')
      .select('id, name')
      .in('id', toolIds)

    // 获取每个评论的回复数
    const commentIds = data.map(c => c.id)
    const { data: replies } = await client
      .from('comments')
      .select('parent_id')
      .in('parent_id', commentIds)
    
    const replyCounts: Record<number, number> = {}
    if (replies) {
      replies.forEach(r => {
        if (r.parent_id) {
          replyCounts[r.parent_id] = (replyCounts[r.parent_id] || 0) + 1
        }
      })
    }

    // 组装数据
    const comments = data.map(comment => {
      const user = users?.find(u => u.id === comment.user_id)
      const tool = tools?.find(t => t.id === comment.tool_id)
      
      return {
        id: comment.id,
        content: comment.content,
        rating: comment.rating,
        created_at: comment.created_at,
        is_featured: comment.is_featured || false,
        reply_count: replyCounts[comment.id] || 0,
        user: user ? {
          id: user.id,
          name: user.name,
          avatar: user.avatar
        } : null,
        tool: tool ? {
          id: tool.id,
          name: tool.name
        } : null
      }
    })

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
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
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
