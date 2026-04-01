import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClientAsync } from '@/storage/database/supabase-client'

/**
 * 获取公告列表
 */
export async function GET(request: NextRequest) {
  try {
    const client = await getSupabaseClientAsync()
    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('isActive')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    let query = client
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (isActive === 'true') {
      query = query.eq('is_active', true)
    }
    
    const { data: announcements, error } = await query
    
    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: announcements || []
    })
    
  } catch (error: any) {
    console.error('获取公告错误:', error)
    
    // 如果是数据库未配置错误
    if (error.message && error.message.includes('not configured')) {
      return NextResponse.json({
        success: false,
        error: 'Database not configured',
        message: '请先配置数据库连接'
      }, { status: 400 })
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
