import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 获取AI名人堂列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const client = getSupabaseClient()

    let query = client
      .from('ai_hall_of_fame')
      .select('*', { count: 'exact' })

    // 筛选条件
    if (category) {
      query = query.eq('category', category)
    }
    if (featured === 'true') {
      query = query.eq('is_featured', true)
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,name_en.ilike.%${search}%,summary.ilike.%${search}%`)
    }

    // 排序
    const ascending = sortOrder === 'asc'
    if (sortBy === 'view_count') {
      query = query.order('view_count', { ascending })
    } else if (sortBy === 'birth_year') {
      query = query.order('birth_year', { ascending })
    } else {
      query = query.order('is_featured', { ascending: false })
      query = query.order(sortBy, { ascending })
    }

    // 分页
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        data,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('获取AI名人堂列表错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
