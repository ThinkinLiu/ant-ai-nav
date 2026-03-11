import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 获取工具列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const categoryId = searchParams.get('categoryId')
    const publisherId = searchParams.get('publisherId')
    const status = searchParams.get('status') || (publisherId ? '' : 'approved') // 发布者查看自己的工具时不限制状态
    const search = searchParams.get('search')
    const isFeatured = searchParams.get('isFeatured')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const client = getSupabaseClient()
    
    // 如果按评论数排序，需要特殊处理
    if (sortBy === 'comment_count') {
      // 1. 先获取所有符合条件的工具
      let baseQuery = client
        .from('ai_tools')
        .select('id, name, slug, description, website, logo, is_featured, is_free, view_count, favorite_count, created_at, category_id, status, reject_reason', { count: 'exact' })

      if (categoryId) {
        baseQuery = baseQuery.eq('category_id', parseInt(categoryId))
      }
      if (publisherId) {
        baseQuery = baseQuery.eq('publisher_id', publisherId)
      }
      if (status) {
        baseQuery = baseQuery.eq('status', status)
      }
      if (isFeatured === 'true') {
        baseQuery = baseQuery.eq('is_featured', true)
      }
      if (search) {
        baseQuery = baseQuery.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
      }

      // 获取所有工具（分批获取，因为有Supabase限制）
      const allTools: any[] = []
      let offset = 0
      const batchSize = 1000
      let hasMore = true

      while (hasMore) {
        const { data, error } = await client
          .from('ai_tools')
          .select('id, name, slug, description, website, logo, is_featured, is_free, view_count, favorite_count, created_at, category_id, status, reject_reason, publisher_id')
          .range(offset, offset + batchSize - 1)

        if (error || !data || data.length === 0) {
          hasMore = false
        } else {
          // 应用筛选条件
          let filteredData = data
          if (categoryId) {
            filteredData = filteredData.filter((t: any) => t.category_id === parseInt(categoryId!))
          }
          if (publisherId) {
            filteredData = filteredData.filter((t: any) => t.publisher_id === publisherId)
          }
          if (status) {
            filteredData = filteredData.filter((t: any) => t.status === status)
          }
          if (isFeatured === 'true') {
            filteredData = filteredData.filter((t: any) => t.is_featured === true)
          }
          if (search) {
            const searchLower = search.toLowerCase()
            filteredData = filteredData.filter((t: any) => 
              t.name.toLowerCase().includes(searchLower) || 
              t.description?.toLowerCase().includes(searchLower)
            )
          }
          allTools.push(...filteredData)
          if (data.length < batchSize) {
            hasMore = false
          } else {
            offset += batchSize
          }
        }
      }

      // 2. 获取所有工具的评论数
      const toolIds = allTools.map(t => t.id)
      const commentCountMap = new Map<number, number>()
      
      if (toolIds.length > 0) {
        // 分批查询评论数
        for (let i = 0; i < toolIds.length; i += batchSize) {
          const batchIds = toolIds.slice(i, i + batchSize)
          const { data: commentsData } = await client
            .from('comments')
            .select('tool_id')
            .in('tool_id', batchIds)
            .eq('is_hidden', false)

          if (commentsData) {
            for (const comment of commentsData) {
              const count = commentCountMap.get(comment.tool_id) || 0
              commentCountMap.set(comment.tool_id, count + 1)
            }
          }
        }
      }

      // 3. 添加评论数并排序
      const toolsWithCommentCount = allTools.map(tool => ({
        ...tool,
        comment_count: commentCountMap.get(tool.id) || 0,
      }))

      // 按评论数排序
      const ascending = sortOrder === 'asc'
      toolsWithCommentCount.sort((a, b) => {
        return ascending 
          ? a.comment_count - b.comment_count 
          : b.comment_count - a.comment_count
      })

      // 4. 分页
      const total = toolsWithCommentCount.length
      const from = (page - 1) * limit
      const to = from + limit
      const paginatedTools = toolsWithCommentCount.slice(from, to)

      // 5. 获取分类信息
      const { data: categoriesData } = await client
        .from('categories')
        .select('id, name, slug, description, icon, color')
      
      const categoryMap = new Map(
        (categoriesData || []).map(c => [c.id, c])
      )

      // 6. 组装最终数据
      const finalTools = paginatedTools.map(tool => ({
        ...tool,
        category: categoryMap.get(tool.category_id) || null,
      }))

      return NextResponse.json({
        success: true,
        data: {
          data: finalTools,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      })
    }

    // 普通排序逻辑
    let query = client
      .from('ai_tools')
      .select('id, name, slug, description, website, logo, is_featured, is_free, is_pinned, view_count, favorite_count, created_at, category_id, status, reject_reason', { count: 'exact' })

    // 筛选条件
    if (categoryId) {
      query = query.eq('category_id', parseInt(categoryId))
    }
    if (publisherId) {
      query = query.eq('publisher_id', publisherId)
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

    // 排序 - 先按置顶排序，再按指定字段排序
    const ascending = sortOrder === 'asc'
    query = query.order('is_pinned', { ascending: false })
    query = query.order(sortBy, { ascending })

    // 分页
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    // 并行查询工具、分类和评论数
    const [toolsResult, categoriesResult, commentsResult] = await Promise.all([
      query,
      client.from('categories').select('id, name, slug, description, icon, color'),
      // 如果有工具ID列表，查询评论数
      Promise.resolve(null as any)
    ])

    if (toolsResult.error) {
      return NextResponse.json(
        { success: false, error: toolsResult.error.message },
        { status: 400 }
      )
    }

    // 获取工具ID列表
    const toolIds = (toolsResult.data || []).map(t => t.id)

    // 查询评论数
    let commentCountMap = new Map<number, number>()
    if (toolIds.length > 0) {
      const { data: commentsData } = await client
        .from('comments')
        .select('tool_id')
        .in('tool_id', toolIds)
        .eq('is_hidden', false)

      if (commentsData) {
        for (const comment of commentsData) {
          const count = commentCountMap.get(comment.tool_id) || 0
          commentCountMap.set(comment.tool_id, count + 1)
        }
      }
    }

    // 创建分类映射
    const categoryMap = new Map(
      (categoriesResult.data || []).map(c => [c.id, c])
    )

    // 组装工具数据（添加分类信息和评论数）
    const toolsWithCategory = (toolsResult.data || []).map(tool => ({
      ...tool,
      category: categoryMap.get(tool.category_id) || null,
      comment_count: commentCountMap.get(tool.id) || 0,
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
