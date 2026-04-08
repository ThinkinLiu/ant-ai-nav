import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 获取所有友情链接（管理后台）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    const client = getSupabaseClient()

    let query = client
      .from('friend_links')
      .select('*', { count: 'exact' })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        data: data || [],
        total: count || 0,
        page,
        limit,
      },
    })
  } catch (error) {
    console.error('获取友情链接列表错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 创建友情链接（管理后台）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 验证必填字段
    if (!body.name || !body.url) {
      return NextResponse.json(
        { success: false, error: '网站名称和网址为必填项' },
        { status: 400 }
      )
    }

    // 验证 URL 格式
    try {
      new URL(body.url)
    } catch {
      return NextResponse.json(
        { success: false, error: '网址格式不正确' },
        { status: 400 }
      )
    }

    const client = getSupabaseClient()

    // 获取当前最大排序值
    const { data: maxOrderData } = await client
      .from('friend_links')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)

    const newSortOrder = (maxOrderData?.[0]?.sort_order || 0) + 1

    // 插入友情链接
    const { data, error } = await client
      .from('friend_links')
      .insert({
        name: body.name.trim(),
        url: body.url.trim(),
        description: body.description?.trim() || null,
        logo: body.logo?.trim() || null,
        contact_name: body.contact_name?.trim() || null,
        contact_email: body.contact_email?.trim() || null,
        status: 'approved', // 管理后台创建的默认为已通过
        sort_order: newSortOrder,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('创建友情链接错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
