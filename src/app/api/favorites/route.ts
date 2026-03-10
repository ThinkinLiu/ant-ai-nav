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

    if (toolId) {
      // 检查是否已收藏
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

    // 获取收藏列表
    const { data: favorites, error } = await client
      .from('favorites')
      .select('*, ai_tools(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: favorites,
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
