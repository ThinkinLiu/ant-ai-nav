import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 获取评论列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const toolId = searchParams.get('toolId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!toolId) {
      return NextResponse.json(
        { success: false, error: '缺少工具ID' },
        { status: 400 }
      )
    }

    const client = getSupabaseClient()
    
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data: comments, error, count } = await client
      .from('comments')
      .select('*', { count: 'exact' })
      .eq('tool_id', parseInt(toolId))
      .eq('is_hidden', false)
      .is('parent_id', null)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    // 获取用户信息
    const userIds = [...new Set(comments?.map(c => c.user_id) || [])]
    const { data: users } = await client
      .from('users')
      .select('id, name, avatar')
      .in('id', userIds)

    // 获取回复
    const commentIds = comments?.map(c => c.id) || []
    const { data: replies } = await client
      .from('comments')
      .select('*')
      .in('parent_id', commentIds)
      .order('created_at', { ascending: true })

    const replyUserIds = [...new Set(replies?.map(r => r.user_id) || [])]
    const { data: replyUsers } = await client
      .from('users')
      .select('id, name, avatar')
      .in('id', replyUserIds)

    // 组装数据
    const commentsWithUser = (comments || []).map(comment => ({
      ...comment,
      user: users?.find(u => u.id === comment.user_id),
      replies: (replies || [])
        .filter(r => r.parent_id === comment.id)
        .map(reply => ({
          ...reply,
          user: replyUsers?.find(u => u.id === reply.user_id),
        })),
    }))

    return NextResponse.json({
      success: true,
      data: {
        data: commentsWithUser,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('获取评论错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 创建评论
export async function POST(request: NextRequest) {
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

    const { data: { user } } = await client.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: '无效的登录状态' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { toolId, content, rating, parentId } = body

    if (!toolId || !content) {
      return NextResponse.json(
        { success: false, error: '请填写完整信息' },
        { status: 400 }
      )
    }

    const { data: comment, error } = await client
      .from('comments')
      .insert({
        tool_id: toolId,
        user_id: user.id,
        content,
        rating: rating || null,
        parent_id: parentId || null,
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
      data: comment,
    })
  } catch (error) {
    console.error('创建评论错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
