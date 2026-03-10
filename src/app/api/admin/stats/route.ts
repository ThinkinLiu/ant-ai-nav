import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

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

    // 获取统计数据
    const { count: totalUsers } = await client
      .from('users')
      .select('*', { count: 'exact', head: true })

    const { count: totalTools } = await client
      .from('ai_tools')
      .select('*', { count: 'exact', head: true })

    const { count: pendingTools } = await client
      .from('ai_tools')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    const { count: approvedTools } = await client
      .from('ai_tools')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')

    const { count: totalComments } = await client
      .from('comments')
      .select('*', { count: 'exact', head: true })

    const { count: publisherCount } = await client
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'publisher')

    return NextResponse.json({
      success: true,
      data: {
        totalUsers: totalUsers || 0,
        totalTools: totalTools || 0,
        pendingTools: pendingTools || 0,
        approvedTools: approvedTools || 0,
        totalComments: totalComments || 0,
        publisherCount: publisherCount || 0,
      },
    })
  } catch (error) {
    console.error('获取统计数据错误:', error)
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 })
  }
}
