import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 获取待审核工具列表
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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    let query = client
      .from('ai_tools')
      .select('*', { count: 'exact' })

    if (status) {
      query = query.eq('status', status)
    }

    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data: tools, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    // 获取分类和发布者信息
    const { data: categories } = await client.from('categories').select('*')
    const publisherIds = [...new Set(tools?.map(t => t.publisher_id) || [])]
    const { data: publishers } = await client
      .from('users')
      .select('id, name, email, avatar')
      .in('id', publisherIds)

    const toolsWithInfo = (tools || []).map(tool => ({
      ...tool,
      category: categories?.find(c => c.id === tool.category_id),
      publisher: publishers?.find(p => p.id === tool.publisher_id),
    }))

    return NextResponse.json({
      success: true,
      data: { data: toolsWithInfo, total: count || 0, page, limit, totalPages: Math.ceil((count || 0) / limit) },
    })
  } catch (error) {
    console.error('获取工具列表错误:', error)
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 })
  }
}
