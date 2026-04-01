import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 获取收藏列表
export async function GET(request: NextRequest) {
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

    const { data: { user } } = await client.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: '无效的登录状态' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const toolId = searchParams.get('toolId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '24')
    const categoryId = searchParams.get('categoryId')

    // 如果有 toolId 参数，检查是否已收藏
    if (toolId) {
      const { data: favorite } = await client
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .eq('tool_id', parseInt(toolId))
        .single()

      return NextResponse.json({
        success: true,
        data: { isFavorited: !!favorite },
      })
    }

    // 获取分类映射
    const { data: categories } = await client
      .from('categories')
      .select('id, name, slug, color')

    const categoryMap = new Map(
      (categories || []).map(c => [c.id, c])
    )

    // 第一步：获取所有收藏记录
    const { data: allFavorites, error: favError } = await client
      .from('favorites')
      .select('id, tool_id, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (favError) {
      console.error('获取收藏记录错误:', JSON.stringify(favError))
      return NextResponse.json(
        { success: false, error: `查询错误: ${favError.message}` },
        { status: 400 }
      )
    }

    // 如果没有收藏，直接返回空结果
    if (!allFavorites || allFavorites.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          favorites: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
      })
    }

    // 获取所有工具ID
    const allToolIds = allFavorites.map(f => f.tool_id)

    // 第二步：获取工具信息（带分类筛选）
    let toolsQuery = client
      .from('ai_tools')
      .select('id, name, description, website, logo, is_free, category_id')
      .in('id', allToolIds)

    // 如果有分类筛选，先获取符合分类的工具
    let filteredToolIds = allToolIds
    if (categoryId) {
      const { data: filteredTools } = await client
        .from('ai_tools')
        .select('id')
        .in('id', allToolIds)
        .eq('category_id', parseInt(categoryId))
      
      filteredToolIds = (filteredTools || []).map(t => t.id)
    }

    if (filteredToolIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          favorites: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
      })
    }

    // 获取筛选后的工具详情
    const { data: toolsData, error: toolsError } = await client
      .from('ai_tools')
      .select('id, name, description, website, logo, is_free, category_id')
      .in('id', filteredToolIds)

    if (toolsError) {
      console.error('获取工具信息错误:', JSON.stringify(toolsError))
      return NextResponse.json(
        { success: false, error: `查询工具错误: ${toolsError.message}` },
        { status: 400 }
      )
    }

    // 第三步：合并数据并保持收藏顺序
    const toolsMap = new Map(toolsData?.map(t => [t.id, t]) || [])
    
    // 按收藏时间顺序组装数据
    const allFavoritesWithTools = allFavorites
      .filter(f => toolsMap.has(f.tool_id))
      .map(f => ({
        id: f.id,
        created_at: f.created_at,
        ai_tools: {
          ...toolsMap.get(f.tool_id),
          category: categoryMap.get(toolsMap.get(f.tool_id)?.category_id) || null
        }
      }))

    // 分页处理
    const total = allFavoritesWithTools.length
    const totalPages = Math.ceil(total / limit)
    const offset = (page - 1) * limit
    const paginatedFavorites = allFavoritesWithTools.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      data: {
        favorites: paginatedFavorites,
        total,
        page,
        limit,
        totalPages,
      },
    })
  } catch (error) {
    console.error('获取收藏错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 添加/取消收藏
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

    const { data: { user } } = await client.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: '无效的登录状态' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { toolId, action } = body

    if (!toolId) {
      return NextResponse.json(
        { success: false, error: '缺少工具ID' },
        { status: 400 }
      )
    }

    if (action === 'remove') {
      // 取消收藏
      const { error } = await client
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('tool_id', toolId)

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        )
      }

      // 更新收藏数
      const { data: tool } = await client
        .from('ai_tools')
        .select('favorite_count')
        .eq('id', toolId)
        .single()

      if (tool) {
        await client
          .from('ai_tools')
          .update({ favorite_count: Math.max(0, (tool.favorite_count || 0) - 1) })
          .eq('id', toolId)
      }

      return NextResponse.json({
        success: true,
        message: '取消收藏成功',
      })
    } else {
      // 添加收藏
      const { error } = await client
        .from('favorites')
        .insert({
          user_id: user.id,
          tool_id: toolId,
        })

      if (error) {
        if (error.code === '23505') {
          return NextResponse.json(
            { success: false, error: '已收藏过此工具' },
            { status: 400 }
          )
        }
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        )
      }

      // 更新收藏数
      const { data: tool } = await client
        .from('ai_tools')
        .select('favorite_count')
        .eq('id', toolId)
        .single()

      if (tool) {
        await client
          .from('ai_tools')
          .update({ favorite_count: (tool.favorite_count || 0) + 1 })
          .eq('id', toolId)
      }

      return NextResponse.json({
        success: true,
        message: '收藏成功',
      })
    }
  } catch (error) {
    console.error('收藏操作错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
