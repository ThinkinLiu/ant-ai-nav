import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 获取AI大事纪列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const year = searchParams.get('year')
    const category = searchParams.get('category')
    const importance = searchParams.get('importance')
    const search = searchParams.get('search')
    const yearRange = searchParams.get('yearRange') // e.g., "1950-1980"

    const client = getSupabaseClient()

    let query = client
      .from('ai_timeline')
      .select('*', { count: 'exact' })

    // 筛选条件
    if (year) {
      query = query.eq('year', parseInt(year))
    }
    if (yearRange) {
      const [start, end] = yearRange.split('-').map(Number)
      query = query.gte('year', start).lte('year', end)
    }
    if (category) {
      query = query.eq('category', category)
    }
    if (importance) {
      query = query.eq('importance', importance)
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // 按年份降序排序
    query = query.order('year', { ascending: false })
    query = query.order('month', { ascending: false, nullsFirst: false })
    query = query.order('day', { ascending: false, nullsFirst: false })

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

    // 获取年份范围统计
    const { data: yearStats } = await client
      .from('ai_timeline')
      .select('year')
      .order('year', { ascending: true })

    const decades: Record<string, number> = {}
    yearStats?.forEach(item => {
      const decade = Math.floor(item.year / 10) * 10
      const key = `${decade}s`
      decades[key] = (decades[key] || 0) + 1
    })

    return NextResponse.json({
      success: true,
      data: {
        data,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
        decades,
      },
    })
  } catch (error) {
    console.error('获取AI大事纪列表错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
