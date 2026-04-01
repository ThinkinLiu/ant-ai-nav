import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClientAsync } from '@/storage/database/supabase-client'

/**
 * 获取工具列表
 * 支持分页、排序、筛选
 */
export async function GET(request: NextRequest) {
  try {
    const client = await getSupabaseClientAsync()
    const { searchParams } = new URL(request.url)
    
    // 分页参数
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '16')
    const offset = (page - 1) * limit
    
    // 排序参数
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    
    // 筛选参数
    const categoryId = searchParams.get('categoryId')
    const tagId = searchParams.get('tagId')
    const search = searchParams.get('search')
    const isApproved = searchParams.get('isApproved') === 'true'
    const isFeatured = searchParams.get('isFeatured') === 'true'

    // 构建查询
    let query = client
      .from('tools')
      .select('id, name, slug, description, logo_url, category_id, tags, view_count, created_at, is_featured, is_approved', { count: 'exact' })
      .eq('is_approved', true)
    
    // 应用筛选
    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }
    
    if (tagId) {
      query = query.contains('tags', [tagId])
    }
    
    if (search) {
      query = query.ilike('name', `%${search}%`)
    }
    
    if (isFeatured) {
      query = query.eq('is_featured', true)
    }
    
    // 应用排序
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })
    
    // 应用分页
    query = query.range(offset, offset + limit - 1)
    
    const { data: tools, error, count } = await query
    
    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: tools || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
    
  } catch (error: any) {
    console.error('获取工具列表错误:', error)
    
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
