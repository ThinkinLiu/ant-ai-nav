import { NextRequest } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

interface AuthResult {
  success: boolean
  userId?: string
  error?: string
  status: number
}

interface TokenPayload {
  userId: string
  email?: string
  phone?: string
  name?: string
  role?: string
  exp: number
}

/**
 * 验证请求的认证信息
 * 支持两种token格式：
 * 1. Supabase access token
 * 2. 自定义Base64编码的JSON token
 */
export async function verifyAuth(request: NextRequest): Promise<AuthResult> {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { success: false, error: '请先登录', status: 401 }
  }

  const token = authHeader.substring(7)

  // 先尝试作为Supabase token验证
  const client = getSupabaseClient(token)
  const { data: { user }, error } = await client.auth.getUser()

  if (user && !error) {
    // Supabase token验证成功
    return { success: true, userId: user.id, status: 200 }
  }

  // 尝试作为自定义token验证
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const payload: TokenPayload = JSON.parse(decoded)

    // 检查是否过期
    if (payload.exp && payload.exp < Date.now()) {
      return { success: false, error: '登录已过期', status: 401 }
    }

    // 验证用户是否存在
    const { data: userData, error: userError } = await client
      .from('users')
      .select('id, role')
      .eq('id', payload.userId)
      .single()

    if (userError || !userData) {
      return { success: false, error: '用户不存在', status: 401 }
    }

    return { success: true, userId: userData.id, status: 200 }
  } catch {
    return { success: false, error: '无效的登录状态', status: 401 }
  }
}

/**
 * 验证管理员权限
 */
export async function verifyAdmin(request: NextRequest): Promise<AuthResult> {
  const authResult = await verifyAuth(request)
  if (!authResult.success) {
    return authResult
  }

  const client = getSupabaseClient()
  const { data: userData, error } = await client
    .from('users')
    .select('role')
    .eq('id', authResult.userId)
    .single()

  if (error || !userData || userData.role !== 'admin') {
    return { success: false, error: '无权限访问', status: 403 }
  }

  return authResult
}
