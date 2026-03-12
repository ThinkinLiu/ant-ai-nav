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
    const ascending = sortOrder === 'asc'

    // 如果没有分类筛选，需要特殊处理：团队放最后
    if (!category) {
      // 查询非团队数据
      let nonTeamQuery = client
        .from('ai_hall_of_fame')
        .select('*', { count: 'exact' })
        .neq('category', 'team')

      if (featured === 'true') {
        nonTeamQuery = nonTeamQuery.eq('is_featured', true)
      }
      if (search) {
        nonTeamQuery = nonTeamQuery.or(`name.ilike.%${search}%,name_en.ilike.%${search}%,summary.ilike.%${search}%`)
      }

      // 应用排序
      if (sortBy === 'view_count') {
        nonTeamQuery = nonTeamQuery.order('view_count', { ascending })
      } else if (sortBy === 'birth_year') {
        nonTeamQuery = nonTeamQuery.order('birth_year', { ascending, nullsFirst: false })
      } else {
        nonTeamQuery = nonTeamQuery.order('created_at', { ascending: false })
      }

      const { data: nonTeamData, count: nonTeamCount, error: nonTeamError } = await nonTeamQuery

      // 查询团队数据
      let teamQuery = client
        .from('ai_hall_of_fame')
        .select('*')
        .eq('category', 'team')

      if (featured === 'true') {
        teamQuery = teamQuery.eq('is_featured', true)
      }
      if (search) {
        teamQuery = teamQuery.or(`name.ilike.%${search}%,name_en.ilike.%${search}%,summary.ilike.%${search}%`)
      }

      if (sortBy === 'view_count') {
        teamQuery = teamQuery.order('view_count', { ascending })
      } else if (sortBy === 'birth_year') {
        teamQuery = teamQuery.order('birth_year', { ascending, nullsFirst: false })
      } else {
        teamQuery = teamQuery.order('created_at', { ascending: false })
      }

      const { data: teamData, error: teamError } = await teamQuery

      if (nonTeamError || teamError) {
        return NextResponse.json(
          { success: false, error: nonTeamError?.message || teamError?.message },
          { status: 400 }
        )
      }

      // 合并数据：非团队在前，团队在后
      const allData = [...(nonTeamData || []), ...(teamData || [])]
      const totalCount = (nonTeamCount || 0) + (teamData?.length || 0)

      // 分页
      const from = (page - 1) * limit
      const to = from + limit
      const paginatedData = allData.slice(from, to)

      return NextResponse.json({
        success: true,
        data: {
          data: paginatedData,
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      })
    }

    // 有分类筛选时，正常查询
    let query = client
      .from('ai_hall_of_fame')
      .select('*', { count: 'exact' })

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
    if (sortBy === 'view_count') {
      query = query.order('view_count', { ascending })
    } else if (sortBy === 'birth_year') {
      query = query.order('birth_year', { ascending, nullsFirst: false })
    } else {
      query = query.order('created_at', { ascending: false })
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
