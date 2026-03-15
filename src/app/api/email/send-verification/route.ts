import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'
import nodemailer from 'nodemailer'

// 生成6位验证码
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// 创建邮件传输器
async function createTransporter() {
  const client = getSupabaseClient()
  
  const { data: settings } = await client
    .from('smtp_settings')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!settings || !settings.host || !settings.user_name || !settings.password) {
    throw new Error('SMTP配置不完整')
  }

  return {
    transporter: nodemailer.createTransport({
      host: settings.host,
      port: settings.port,
      secure: settings.secure,
      auth: {
        user: settings.user_name,
        pass: settings.password,
      },
    }),
    fromEmail: settings.from_email,
    fromName: settings.from_name || '蚂蚁AI导航',
  }
}

// 发送验证码邮件
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, type = 'register' } = body

    if (!email) {
      return NextResponse.json(
        { success: false, error: '请输入邮箱地址' },
        { status: 400 }
      )
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: '邮箱格式不正确' },
        { status: 400 }
      )
    }

    // 检查发送频率限制（60秒内只能发送一次）
    const client = getSupabaseClient()
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString()
    
    const { data: recentCodes } = await client
      .from('email_verification_codes')
      .select('created_at')
      .eq('email', email)
      .eq('type', type)
      .gte('created_at', oneMinuteAgo)
      .limit(1)

    if (recentCodes && recentCodes.length > 0) {
      return NextResponse.json(
        { success: false, error: '验证码发送过于频繁，请60秒后再试' },
        { status: 429 }
      )
    }

    // 检查邮箱是否已注册（注册时）
    if (type === 'register') {
      const { data: existingUser } = await client
        .from('users')
        .select('id')
        .eq('email', email)
        .limit(1)

      if (existingUser && existingUser.length > 0) {
        return NextResponse.json(
          { success: false, error: '该邮箱已被注册' },
          { status: 400 }
        )
      }
    }

    // 生成验证码
    const code = generateCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10分钟后过期

    // 保存验证码到数据库
    const { error: insertError } = await client
      .from('email_verification_codes')
      .insert({
        email,
        code,
        type,
        expires_at: expiresAt.toISOString(),
      })

    if (insertError) {
      console.error('保存验证码失败:', insertError)
      return NextResponse.json(
        { success: false, error: '验证码保存失败，请稍后重试' },
        { status: 500 }
      )
    }

    // 获取SMTP配置并发送邮件
    let transporterInfo
    try {
      transporterInfo = await createTransporter()
    } catch (error) {
      console.error('SMTP配置错误:', error)
      return NextResponse.json(
        { success: false, error: '邮件服务配置不完整，请联系管理员' },
        { status: 500 }
      )
    }

    // 发送邮件
    try {
      await transporterInfo.transporter.sendMail({
        from: `"${transporterInfo.fromName}" <${transporterInfo.fromEmail}>`,
        to: email,
        subject: type === 'register' ? '【蚂蚁AI导航】注册验证码' : '【蚂蚁AI导航】邮箱验证码',
        html: `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #6366f1; margin: 0;">蚂蚁AI导航</h1>
            </div>
            <div style="background: #f8fafc; border-radius: 12px; padding: 30px;">
              <h2 style="color: #1e293b; margin-top: 0;">邮箱验证</h2>
              <p style="color: #64748b; font-size: 15px;">您好！</p>
              <p style="color: #64748b; font-size: 15px;">您正在进行${type === 'register' ? '账号注册' : '邮箱验证'}，验证码如下：</p>
              <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 8px; margin: 20px 0; letter-spacing: 8px;">
                ${code}
              </div>
              <p style="color: #94a3b8; font-size: 13px;">验证码10分钟内有效，请勿泄露给他人。</p>
            </div>
            <div style="text-align: center; margin-top: 30px; color: #94a3b8; font-size: 12px;">
              <p>此邮件由系统自动发送，请勿回复</p>
              <p>© ${new Date().getFullYear()} 蚂蚁AI导航</p>
            </div>
          </div>
        `,
      })
    } catch (error) {
      console.error('发送邮件失败:', error)
      return NextResponse.json(
        { success: false, error: '邮件发送失败，请检查邮箱地址是否正确' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '验证码已发送，请查收邮件',
    })
  } catch (error) {
    console.error('发送验证码错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 验证验证码
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, code, type = 'register' } = body

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: '请输入邮箱和验证码' },
        { status: 400 }
      )
    }

    const client = getSupabaseClient()
    const now = new Date().toISOString()

    // 查找有效的验证码
    const { data: verification, error } = await client
      .from('email_verification_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .eq('type', type)
      .eq('is_used', false)
      .gt('expires_at', now)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !verification) {
      return NextResponse.json(
        { success: false, error: '验证码无效或已过期' },
        { status: 400 }
      )
    }

    // 标记验证码已使用
    await client
      .from('email_verification_codes')
      .update({ is_used: true })
      .eq('id', verification.id)

    return NextResponse.json({
      success: true,
      message: '验证成功',
    })
  } catch (error) {
    console.error('验证验证码错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
