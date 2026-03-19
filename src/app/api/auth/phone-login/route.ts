import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'
import { randomUUID } from 'crypto'

// 手机号登录/注册
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, code } = body

    if (!phone || !code) {
      return NextResponse.json(
        { success: false, error: '请输入手机号和验证码' },
        { status: 400 }
      )
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { success: false, error: '手机号码格式不正确' },
        { status: 400 }
      )
    }

    const client = getSupabaseClient()
    const now = new Date().toISOString()

    // 查找有效的验证码
    const { data: verification, error: verifyError } = await client
      .from('sms_verification_codes')
      .select('*')
      .eq('phone', phone)
      .eq('code', code)
      .eq('type', 'login')
      .eq('is_used', false)
      .gt('expires_at', now)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (verifyError || !verification) {
      return NextResponse.json(
        { success: false, error: '验证码无效或已过期' },
        { status: 400 }
      )
    }

    // 标记验证码已使用
    await client
      .from('sms_verification_codes')
      .update({ is_used: true })
      .eq('id', verification.id)

    // 查找是否已有该手机号的用户
    const { data: existingUser } = await client
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single()

    let user
    let isNewUser = false

    if (existingUser) {
      // 已有用户，直接登录
      user = existingUser
    } else {
      // 新用户，自动注册
      isNewUser = true
      const userId = randomUUID()
      
      const { data: newUser, error: createError } = await client
        .from('users')
        .insert({
          id: userId,
          phone,
          email: `phone_${phone}@placeholder.local`,
          name: `用户${phone.slice(-4)}`,
          role: 'user',
          is_active: true,
        })
        .select()
        .single()

      if (createError) {
        console.error('创建用户失败:', createError)
        return NextResponse.json(
          { success: false, error: '创建用户失败' },
          { status: 500 }
        )
      }
      
      user = newUser
    }

    // 更新最后登录时间
    await client
      .from('users')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', user.id)

    // 生成登录token
    const sessionToken = Buffer.from(JSON.stringify({
      userId: user.id,
      phone: user.phone,
      email: user.email,
      name: user.name,
      role: user.role,
      exp: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30天
    })).toString('base64')

    return NextResponse.json({
      success: true,
      isNewUser,
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
      },
      token: sessionToken,
    })
  } catch (error: any) {
    console.error('手机号登录错误:', error)
    return NextResponse.json(
      { success: false, error: error.message || '服务器错误' },
      { status: 500 }
    )
  }
}
