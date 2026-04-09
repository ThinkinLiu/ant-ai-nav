import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: '请先登录' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const client = getSupabaseClient(token)

    const { data: { user } } = await client.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, error: '无效的登录状态' }, { status: 401 })
    }

    const { data: userData } = await client
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'admin') {
      return NextResponse.json({ success: false, error: '无权限' }, { status: 403 })
    }

    const body = await request.json()
    const { ids, action, reason } = body

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, error: '请选择要操作的工具' }, { status: 400 })
    }

    if (!action || !['approve', 'reject', 'delete'].includes(action)) {
      return NextResponse.json({ success: false, error: '无效的操作类型' }, { status: 400 })
    }

    if (action === 'reject' && !reason?.trim()) {
      return NextResponse.json({ success: false, error: '请填写拒绝理由' }, { status: 400 })
    }

    // 执行批量操作
    if (action === 'approve') {
      const { error } = await client
        .from('ai_tools')
        .update({ status: 'approved', reject_reason: null })
        .in('id', ids)

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 })
      }

      return NextResponse.json({
        success: true,
        message: `已通过 ${ids.length} 个工具`,
        data: { count: ids.length }
      })
    } else if (action === 'reject') {
      const { error } = await client
        .from('ai_tools')
        .update({ status: 'rejected', reject_reason: reason })
        .in('id', ids)

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 })
      }

      return NextResponse.json({
        success: true,
        message: `已拒绝 ${ids.length} 个工具`,
        data: { count: ids.length }
      })
    } else if (action === 'delete') {
      const { error } = await client
        .from('ai_tools')
        .delete()
        .in('id', ids)

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 })
      }

      return NextResponse.json({
        success: true,
        message: `已删除 ${ids.length} 个工具`,
        data: { count: ids.length }
      })
    }
  } catch (error) {
    console.error('批量操作错误:', error)
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 })
  }
}
