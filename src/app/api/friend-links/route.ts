import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 获取已审核的友情链接列表（公开）
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient()

    const { data, error } = await client
      .from('friend_links')
      .select('id, name, url, description, logo')
      .eq('status', 'approved')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    })
  } catch (error) {
    console.error('获取友情链接错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 提交友情链接申请
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, url, description, logo, contactEmail, contactName } = body

    // 验证必填字段
    if (!name || !url) {
      return NextResponse.json(
        { success: false, error: '网站名称和网址为必填项' },
        { status: 400 }
      )
    }

    // 验证URL格式
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { success: false, error: '请输入有效的网址（需包含 http:// 或 https://）' },
        { status: 400 }
      )
    }

    const client = getSupabaseClient()

    // 检查URL是否已存在
    const { data: existing } = await client
      .from('friend_links')
      .select('id, status')
      .eq('url', url)
      .single()

    if (existing) {
      if (existing.status === 'approved') {
        return NextResponse.json(
          { success: false, error: '该网址已被收录' },
          { status: 400 }
        )
      } else if (existing.status === 'pending') {
        return NextResponse.json(
          { success: false, error: '该网址已提交申请，正在审核中' },
          { status: 400 }
        )
      } else {
        return NextResponse.json(
          { success: false, error: '该网址的申请曾被拒绝，请联系管理员' },
          { status: 400 }
        )
      }
    }

    // 获取提交者IP
    const submitterIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                        request.headers.get('x-real-ip') ||
                        'unknown'

    // 插入申请记录
    const { error } = await client
      .from('friend_links')
      .insert({
        name,
        url,
        description: description || '',
        logo: logo || '',
        contact_email: contactEmail || '',
        contact_name: contactName || '',
        status: 'pending',
        submitter_ip: submitterIp,
      })

    if (error) {
      return NextResponse.json(
        { success: false, error: '提交失败，请稍后重试' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '提交成功，我们将在1-3个工作日内审核，请耐心等待',
    })
  } catch (error) {
    console.error('提交友情链接错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
