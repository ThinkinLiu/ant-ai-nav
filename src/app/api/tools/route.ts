import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 获取工具列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const categoryId = searchParams.get('categoryId')
    const status = searchParams.get('status') || 'approved'
    const search = searchParams.get('search')
    const isFeatured = searchParams.get('isFeatured')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const client = getSupabaseClient()
    
    // 构建查询
    let query = client
      .from('ai_tools')
      .select('id, name, slug, description, website, logo, is_featured, is_free, view_count, favorite_count, created_at, category_id', { count: 'exact' })

    // 筛选条件
    if (categoryId) {
      query = query.eq('category_id', parseInt(categoryId))
    }
    if (status) {
      query = query.eq('status', status)
    }
    if (isFeatured === 'true') {
      query = query.eq('is_featured', true)
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // 排序
    const ascending = sortOrder === 'asc'
    query = query.order(sortBy, { ascending })

    // 分页
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    // 并行查询工具和分类
    const [toolsResult, categoriesResult] = await Promise.all([
      query,
      client.from('categories').select('id, name, slug, description, icon, color')
    ])

    if (toolsResult.error) {
      return NextResponse.json(
        { success: false, error: toolsResult.error.message },
        { status: 400 }
      )
    }

    // 创建分类映射
    const categoryMap = new Map(
      (categoriesResult.data || []).map(c => [c.id, c])
    )

    // 组装工具数据（添加分类信息）
    const toolsWithCategory = (toolsResult.data || []).map(tool => ({
      ...tool,
      category: categoryMap.get(tool.category_id) || null,
    }))

    return NextResponse.json({
      success: true,
      data: {
        data: toolsWithCategory,
        total: toolsResult.count || 0,
        page,
        limit,
        totalPages: Math.ceil((toolsResult.count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('获取工具列表错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 创建工具
export async function POST(request: NextRequest) {
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

    // 获取当前用户
    const { data: { user }, error: authError } = await client.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '无效的登录状态' },
        { status: 401 }
      )
    }

    // 检查用户角色
    const { data: userData } = await client
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userData || (userData.role !== 'publisher' && userData.role !== 'admin')) {
      return NextResponse.json(
        { success: false, error: '您没有发布工具的权限，请先申请成为发布者' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, description, longDescription, website, logo, categoryId, isFree, pricingInfo, tags } = body

    if (!name || !description || !website || !categoryId) {
      return NextResponse.json(
        { success: false, error: '请填写必要信息' },
        { status: 400 }
      )
    }

    // 生成 slug
    const slug = name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '') + '-' + Math.random().toString(36).substring(2, 8)

    // 创建工具
    const { data: tool, error } = await client
      .from('ai_tools')
      .insert({
        name,
        slug,
        description,
        long_description: longDescription,
        website,
        logo,
        category_id: categoryId,
        publisher_id: user.id,
        status: 'pending',
        is_free: isFree ?? true,
        pricing_info: pricingInfo,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    // 处理标签
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        // 查找或创建标签
        let { data: tag } = await client
          .from('tags')
          .select('id')
          .eq('slug', tagName.toLowerCase())
          .single()

        if (!tag) {
          const { data: newTag } = await client
            .from('tags')
            .insert({
              name: tagName,
              slug: tagName.toLowerCase(),
            })
            .select('id')
            .single()
          tag = newTag
        }

        if (tag) {
          await client.from('tool_tags').insert({
            tool_id: tool.id,
            tag_id: tag.id,
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: tool,
    })
  } catch (error) {
    console.error('创建工具错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
