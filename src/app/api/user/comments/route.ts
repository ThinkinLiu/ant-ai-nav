import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 获取当前用户的评论
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

    const { data: { user } } = await client.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: '无效的登录状态' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const from = (page - 1) * limit
    const to = from + limit - 1

    // 获取用户的评论
    const { data: comments, error, count } = await client
      .from('comments')
      .select('id, content, rating, created_at, tool_id', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    // 获取对应的工具信息
    const toolIds = [...new Set(comments?.map(c => c.tool_id) || [])]
    const { data: tools } = await client
      .from('ai_tools')
      .select('id, name, slug')
      .in('id', toolIds)

    // 组装数据
    const commentsWithTools = (comments || []).map(comment => ({
      ...comment,
      ai_tools: tools?.find(t => t.id === comment.tool_id) || null,
    }))

    return NextResponse.json({
      success: true,
      data: {
        data: commentsWithTools,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('获取用户评论错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
