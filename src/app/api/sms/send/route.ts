import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'
import crypto from 'crypto'

// 生成6位验证码
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// 阿里云短信发送
async function sendAliyunSMS(
  phone: string,
  code: string,
  config: {
    access_key_id: string
    access_key_secret: string
    sign_name: string
    template_code: string
  }
): Promise<{ success: boolean; error?: string }> {
  const { access_key_id, access_key_secret, sign_name, template_code } = config

  const params = new URLSearchParams({
    PhoneNumbers: phone,
    SignName: sign_name,
    TemplateCode: template_code,
    TemplateParam: JSON.stringify({ code }),
    OutId: '',
    RegionId: 'cn-hangzhou',
    Action: 'SendSms',
    Version: '2017-05-25',
    Format: 'JSON',
    Timestamp: new Date().toISOString(),
    SignatureMethod: 'HMAC-SHA1',
    SignatureVersion: '1.0',
    SignatureNonce: crypto.randomUUID(),
    AccessKeyId: access_key_id,
  })

  // 构造签名字符串
  const canonicalizedQueryString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')

  const stringToSign = `POST&${encodeURIComponent('/')}&${encodeURIComponent(canonicalizedQueryString)}`
  
  // 计算签名
  const signature = crypto
    .createHmac('sha1', `${access_key_secret}&`)
    .update(stringToSign)
    .digest('base64')

  params.set('Signature', signature)

  try {
    const response = await fetch('https://dysmsapi.aliyuncs.com/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    const data = await response.json()
    
    if (data.Code === 'OK') {
      return { success: true }
    } else {
      console.error('阿里云短信发送失败:', data)
      return { success: false, error: data.Message || '短信发送失败' }
    }
  } catch (error) {
    console.error('阿里云短信发送错误:', error)
    return { success: false, error: '短信发送失败' }
  }
}

// 腾讯云短信发送
async function sendTencentSMS(
  phone: string,
  code: string,
  config: {
    access_key_id: string
    access_key_secret: string
    sign_name: string
    template_code: string
  }
): Promise<{ success: boolean; error?: string }> {
  const { access_key_id, access_key_secret, sign_name, template_code } = config

  const host = 'sms.tencentcloudapi.com'
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const nonce = crypto.randomUUID()
  
  const params = {
    PhoneNumberSet: [`+86${phone}`],
    SmsSdkAppId: template_code.split('_')[0] || '1400', // 从模板ID中提取AppId
    SignName: sign_name,
    TemplateId: template_code,
    TemplateParamSet: [code],
  }

  const payload = JSON.stringify(params)
  
  // 计算签名
  const canonicalRequest = `POST\n/\n\ncontent-type:application/json\nhost:${host}\n\ncontent-type;host\n${crypto.createHash('sha256').update(payload).digest('hex')}`
  const stringToSign = `TC3-HMAC-SHA256\n${timestamp}\n${timestamp}/sms/tc3_request\n${crypto.createHash('sha256').update(canonicalRequest).digest('hex')}`
  
  const secretDate = crypto.createHmac('sha256', `TC3${access_key_secret}`).update(timestamp).digest()
  const secretSigning = crypto.createHmac('sha256', secretDate).update('sms').digest()
  const signature = crypto.createHmac('sha256', secretSigning).update('tc3_request').digest('hex')

  try {
    const response = await fetch(`https://${host}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Host': host,
        'X-TC-Action': 'SendSms',
        'X-TC-Version': '2021-01-11',
        'X-TC-Timestamp': timestamp,
        'X-TC-Nonce': nonce,
        'Authorization': `TC3-HMAC-SHA256 Credential=${access_key_id}/${timestamp}/sms/tc3_request, SignedHeaders=content-type;host, Signature=${signature}`,
      },
      body: payload,
    })

    const data = await response.json()
    
    if (data.Response && data.Response.SendStatusSet && data.Response.SendStatusSet[0]?.Code === 'Ok') {
      return { success: true }
    } else {
      console.error('腾讯云短信发送失败:', data)
      return { success: false, error: data.Response?.Error?.Message || '短信发送失败' }
    }
  } catch (error) {
    console.error('腾讯云短信发送错误:', error)
    return { success: false, error: '短信发送失败' }
  }
}

// 自定义接口发送
async function sendCustomSMS(
  phone: string,
  code: string,
  config: {
    access_key_id: string
    access_key_secret: string
    sign_name: string
    template_code: string
    api_url: string
  }
): Promise<{ success: boolean; error?: string }> {
  const { access_key_id, access_key_secret, sign_name, template_code, api_url } = config

  try {
    const response = await fetch(api_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone,
        code,
        sign_name,
        template_code,
        api_key: access_key_id,
        api_secret: access_key_secret,
      }),
    })

    const data = await response.json()
    
    if (data.success || data.code === 0) {
      return { success: true }
    } else {
      console.error('自定义短信发送失败:', data)
      return { success: false, error: data.message || data.error || '短信发送失败' }
    }
  } catch (error) {
    console.error('自定义短信发送错误:', error)
    return { success: false, error: '短信发送失败' }
  }
}

// 发送短信验证码
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, type = 'login' } = body

    if (!phone) {
      return NextResponse.json(
        { success: false, error: '请输入手机号码' },
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

    // 获取短信配置
    const { data: settings, error: settingsError } = await client
      .from('sms_settings')
      .select('*')
      .eq('is_enabled', true)
      .limit(1)
      .single()

    if (settingsError || !settings) {
      return NextResponse.json(
        { success: false, error: '短信服务未启用，请联系管理员' },
        { status: 500 }
      )
    }

    // 检查发送频率限制（60秒内只能发送一次）
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString()
    
    const { data: recentCodes } = await client
      .from('sms_verification_codes')
      .select('created_at')
      .eq('phone', phone)
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

    // 根据服务商发送短信
    let sendResult: { success: boolean; error?: string }
    
    switch (settings.provider) {
      case 'aliyun':
        sendResult = await sendAliyunSMS(phone, code, {
          access_key_id: settings.access_key_id,
          access_key_secret: settings.access_key_secret,
          sign_name: settings.sign_name,
          template_code: settings.template_code,
        })
        break
      case 'tencent':
        sendResult = await sendTencentSMS(phone, code, {
          access_key_id: settings.access_key_id,
          access_key_secret: settings.access_key_secret,
          sign_name: settings.sign_name,
          template_code: settings.template_code,
        })
        break
      case 'custom':
        sendResult = await sendCustomSMS(phone, code, {
          access_key_id: settings.access_key_id,
          access_key_secret: settings.access_key_secret,
          sign_name: settings.sign_name,
          template_code: settings.template_code,
          api_url: settings.api_url,
        })
        break
      default:
        return NextResponse.json(
          { success: false, error: '不支持的短信服务商' },
          { status: 500 }
        )
    }

    if (!sendResult.success) {
      return NextResponse.json(
        { success: false, error: sendResult.error || '短信发送失败' },
        { status: 500 }
      )
    }

    // 保存验证码到数据库
    const { error: insertError } = await client
      .from('sms_verification_codes')
      .insert({
        phone,
        code,
        type,
        expires_at: expiresAt.toISOString(),
      })

    if (insertError) {
      console.error('保存验证码失败:', insertError)
    }

    return NextResponse.json({
      success: true,
      message: '验证码已发送，请查收短信',
    })
  } catch (error: any) {
    console.error('发送短信验证码错误:', error)
    return NextResponse.json(
      { success: false, error: error.message || '服务器错误' },
      { status: 500 }
    )
  }
}
