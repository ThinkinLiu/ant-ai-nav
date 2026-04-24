import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 获取浏览历史列表
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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '24')

    // 获取分类映射
    const { data: categories } = await client
      .from('categories')
      .select('id, name, slug, color')

    const categoryMap = new Map(
      (categories || []).map(c => [c.id, c])
    )

    // 获取浏览历史记录
    const { data: allHistory, error: historyError } = await client
      .from('browse_history')
      .select('id, tool_id, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (historyError) {
      console.error('获取浏览历史错误:', JSON.stringify(historyError))
      return NextResponse.json(
        { success: false, error: `查询错误: ${historyError.message}` },
        { status: 400 }
      )
    }

    // 如果没有浏览历史，直接返回空结果
    if (!allHistory || allHistory.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          history: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
      })
    }

    // 获取所有工具ID
    const allToolIds = allHistory.map(h => h.tool_id)

    // 获取工具信息
    const { data: toolsData, error: toolsError } = await client
      .from('ai_tools')
      .select('id, name, description, website, logo, is_free, category_id')
      .in('id', allToolIds)

    if (toolsError) {
      console.error('获取工具信息错误:', JSON.stringify(toolsError))
      return NextResponse.json(
        { success: false, error: `查询工具错误: ${toolsError.message}` },
        { status: 400 }
      )
    }

    // 合并数据并保持浏览顺序
    const toolsMap = new Map(toolsData?.map(t => [t.id, t]) || [])
    
    const allHistoryWithTools = allHistory
      .filter(h => toolsMap.has(h.tool_id))
      .map(h => ({
        id: h.id,
        created_at: h.created_at,
        tool: {
          ...toolsMap.get(h.tool_id),
          category: categoryMap.get(toolsMap.get(h.tool_id)?.category_id) || null
        }
      }))

    // 分页处理
    const total = allHistoryWithTools.length
    const totalPages = Math.ceil(total / limit)
    const offset = (page - 1) * limit
    const paginatedHistory = allHistoryWithTools.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      data: {
        history: paginatedHistory,
        total,
        page,
        limit,
        totalPages,
      },
    })
  } catch (error) {
    console.error('获取浏览历史错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 添加浏览记录
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
    const { toolId } = body

    if (!toolId) {
      return NextResponse.json(
        { success: false, error: '缺少工具ID' },
        { status: 400 }
      )
    }

    // 使用 upsert 添加或更新浏览记录（同一用户对同一工具只保留最新记录）
    const { error } = await client
      .from('browse_history')
      .upsert({
        user_id: user.id,
        tool_id: toolId,
        created_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,tool_id',
        ignoreDuplicates: false,
      })

    if (error) {
      console.error('添加浏览记录错误:', JSON.stringify(error))
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '浏览记录已添加',
    })
  } catch (error) {
    console.error('添加浏览记录错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 删除浏览记录
export async function DELETE(request: NextRequest) {
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
    const historyId = searchParams.get('id')
    const toolId = searchParams.get('toolId')

    if (!historyId && !toolId) {
      return NextResponse.json(
        { success: false, error: '缺少记录ID或工具ID' },
        { status: 400 }
      )
    }

    if (historyId) {
      // 删除指定记录
      const { error } = await client
        .from('browse_history')
        .delete()
        .eq('id', parseInt(historyId))
        .eq('user_id', user.id)

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        )
      }
    } else if (toolId) {
      // 删除指定工具的浏览记录
      const { error } = await client
        .from('browse_history')
        .delete()
        .eq('tool_id', parseInt(toolId))
        .eq('user_id', user.id)

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: '删除成功',
    })
  } catch (error) {
    console.error('删除浏览记录错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 清空所有浏览历史
export async function PUT(request: NextRequest) {
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

    const { error } = await client
      .from('browse_history')
      .delete()
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '浏览历史已清空',
    })
  } catch (error) {
    console.error('清空浏览历史错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
