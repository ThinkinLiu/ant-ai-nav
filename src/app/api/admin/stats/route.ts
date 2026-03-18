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

    // 并行获取所有统计数据
    const [
      usersCount,
      toolsCount,
      pendingToolsCount,
      approvedToolsCount,
      rejectedToolsCount,
      commentsCount,
      publishersCount,
      hallOfFameCount,
      featuredPeopleCount,
      timelineCount,
      landmarkEventsCount,
      newsCount,
      publishedNewsCount,
      pendingNewsCount,
    ] = await Promise.all([
      // 用户统计
      client.from('users').select('*', { count: 'exact', head: true }),
      
      // 工具统计
      client.from('ai_tools').select('*', { count: 'exact', head: true }),
      client.from('ai_tools').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      client.from('ai_tools').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      client.from('ai_tools').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
      
      // 评论统计
      client.from('comments').select('*', { count: 'exact', head: true }),
      
      // 发布者统计
      client.from('users').select('*', { count: 'exact', head: true }).eq('role', 'publisher'),
      
      // 名人堂统计
      client.from('ai_hall_of_fame').select('*', { count: 'exact', head: true }),
      client.from('ai_hall_of_fame').select('*', { count: 'exact', head: true }).eq('is_featured', true),
      
      // 大事纪统计
      client.from('ai_timeline').select('*', { count: 'exact', head: true }),
      client.from('ai_timeline').select('*', { count: 'exact', head: true }).eq('importance', 'landmark'),
      
      // 资讯统计
      client.from('ai_news').select('*', { count: 'exact', head: true }),
      client.from('ai_news').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      client.from('ai_news').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    ])

    return NextResponse.json({
      success: true,
      data: {
        // 用户相关
        totalUsers: usersCount.count || 0,
        publisherCount: publishersCount.count || 0,
        
        // 工具相关
        totalTools: toolsCount.count || 0,
        pendingTools: pendingToolsCount.count || 0,
        approvedTools: approvedToolsCount.count || 0,
        rejectedTools: rejectedToolsCount.count || 0,
        
        // 评论相关
        totalComments: commentsCount.count || 0,
        
        // 名人堂相关
        hallOfFameCount: hallOfFameCount.count || 0,
        featuredPeopleCount: featuredPeopleCount.count || 0,
        
        // 大事纪相关
        timelineCount: timelineCount.count || 0,
        landmarkEventsCount: landmarkEventsCount.count || 0,
        
        // 资讯相关
        newsCount: newsCount.count || 0,
        publishedNewsCount: publishedNewsCount.count || 0,
        pendingNewsCount: pendingNewsCount.count || 0,
      },
    })
  } catch (error) {
    console.error('获取统计数据错误:', error)
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 })
  }
}
