import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'
import nodemailer from 'nodemailer'

// 生成6位验证码
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// 获取SMTP配置
async function getSMTPConfig() {
  const client = getSupabaseClient()
  
  const { data: settings, error } = await client
    .from('smtp_settings')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !settings) {
    return null
  }

  if (!settings.host || !settings.user_name || !settings.password || !settings.from_email) {
    return null
  }

  return {
    host: settings.host,
    port: settings.port || 587,
    secure: settings.secure ?? true,
    user: settings.user_name,
    pass: settings.password,
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

    const client = getSupabaseClient()

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

    // 先检查SMTP配置是否完整
    const smtpConfig = await getSMTPConfig()
    if (!smtpConfig) {
      console.error('SMTP配置不完整')
      return NextResponse.json(
        { success: false, error: '邮件服务未配置，请联系管理员在后台设置SMTP服务' },
        { status: 500 }
      )
    }

    // 检查发送频率限制（60秒内只能发送一次）
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

    // 生成验证码
    const code = generateCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10分钟后过期

    // 创建邮件传输器
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.pass,
      },
    })

    // 发送邮件
    try {
      await transporter.sendMail({
        from: `"${smtpConfig.fromName}" <${smtpConfig.fromEmail}>`,
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
    } catch (emailError: any) {
      console.error('发送邮件失败:', emailError)
      console.error('错误详情:', emailError.message)
      
      // 邮件发送失败，返回具体错误
      let errorMessage = '邮件发送失败，请稍后重试'
      
      if (emailError.code === 'ECONNECTION') {
        errorMessage = '无法连接邮件服务器，请检查SMTP服务器地址和端口'
      } else if (emailError.code === 'EAUTH') {
        errorMessage = '邮箱认证失败，请检查邮箱账号和密码/授权码'
      } else if (emailError.code === 'EENVELOPE') {
        errorMessage = '发件人地址无效，请检查发件人邮箱配置'
      } else if (emailError.message?.includes("doesn't conform with authentication")) {
        // 发件人和认证账号不一致
        errorMessage = '发件人邮箱与SMTP认证账号不一致，请在后台将发件人邮箱改为与认证账号相同'
      } else if (emailError.responseCode === 440) {
        errorMessage = '发件人邮箱配置错误，发件人必须与SMTP认证账号一致'
      } else if (emailError.responseCode === 550) {
        errorMessage = '收件人邮箱地址不存在或无效'
      } else if (emailError.responseCode === 551) {
        errorMessage = '收件人邮箱不存在'
      } else if (emailError.responseCode === 554) {
        errorMessage = '邮件被拒绝，可能是发件人或收件人地址无效'
      }
      
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 500 }
      )
    }

    // 邮件发送成功后，保存验证码到数据库
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
      // 验证码保存失败，但邮件已发送，仍然返回成功
      // 因为验证码有效期内的旧验证码可能仍然有效
    }

    return NextResponse.json({
      success: true,
      message: '验证码已发送，请查收邮件',
    })
  } catch (error: any) {
    console.error('发送验证码错误:', error)
    return NextResponse.json(
      { success: false, error: error.message || '服务器错误，请稍后重试' },
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
      { success: false, error: '验证失败，请稍后重试' },
      { status: 500 }
    )
  }
}
