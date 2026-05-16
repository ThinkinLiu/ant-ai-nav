import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 获取存储配置
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

    // 验证用户权限
    const { data: { user } } = await client.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: '无效的登录状态' },
        { status: 401 }
      )
    }

    // 检查是否是管理员
    const { data: userData } = await client
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userData || userData.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: '无权限访问' },
        { status: 403 }
      )
    }

    // 获取存储配置
    const { data: settings, error } = await client
      .from('storage_settings')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    // 返回配置（隐藏密钥）
    const safeSettings = settings ? {
      ...settings,
      s3SecretKey: settings.s3_secret_key ? '******' : '',
      qiniuSecretKey: settings.qiniu_secret_key ? '******' : '',
    } : null

    return NextResponse.json({
      success: true,
      data: safeSettings,
    })
  } catch (error) {
    console.error('获取存储配置错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 更新存储配置
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

    // 验证用户权限
    const { data: { user } } = await client.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: '无效的登录状态' },
        { status: 401 }
      )
    }

    // 检查是否是管理员
    const { data: userData } = await client
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userData || userData.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: '无权限访问' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      storage_type,
      // S3
      s3_endpoint,
      s3_bucket,
      s3_access_key,
      s3_secret_key,
      s3_region,
      s3_public_domain,
      // 七牛云
      qiniu_access_key,
      qiniu_secret_key,
      qiniu_bucket,
      qiniu_domain,
      qiniu_region,
      qiniu_is_private,
      qiniu_public_domain,
      // 本地
      local_upload_dir,
      local_public_path,
      local_base_url,
      // 通用
      max_file_size,
      allowed_extensions,
    } = body

    // 验证必填项
    if (!storage_type) {
      return NextResponse.json(
        { success: false, error: '请选择存储类型' },
        { status: 400 }
      )
    }

    // 根据存储类型验证必填项
    if (storage_type === 's3') {
      if (!s3_endpoint || !s3_bucket) {
        return NextResponse.json(
          { success: false, error: '请填写 S3 端点和存储桶名称' },
          { status: 400 }
        )
      }
    } else if (storage_type === 'qiniu') {
      if (!qiniu_access_key || !qiniu_secret_key || !qiniu_bucket || !qiniu_domain) {
        return NextResponse.json(
          { success: false, error: '请填写完整的七牛云配置' },
          { status: 400 }
        )
      }
    }

    // 检查是否已存在配置
    const { data: existing } = await client
      .from('storage_settings')
      .select('id')
      .eq('is_active', true)
      .limit(1)
      .single()

    let result
    if (existing) {
      // 更新现有配置
      const updateData: Record<string, unknown> = {
        storage_type,
        s3_endpoint: s3_endpoint || null,
        s3_bucket: s3_bucket || null,
        s3_access_key: s3_access_key || null,
        s3_region: s3_region || 'cn-beijing',
        s3_public_domain: s3_public_domain || null,
        qiniu_access_key: qiniu_access_key || null,
        qiniu_secret_key: qiniu_secret_key || null,
        qiniu_bucket: qiniu_bucket || null,
        qiniu_domain: qiniu_domain || null,
        qiniu_region: qiniu_region || 'z0',
        qiniu_is_private: qiniu_is_private || false,
        qiniu_public_domain: qiniu_public_domain || null,
        local_upload_dir: local_upload_dir || 'public/uploads',
        local_public_path: local_public_path || '/uploads',
        local_base_url: local_base_url || null,
        max_file_size: max_file_size || 10485760,
        allowed_extensions: allowed_extensions || ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        updated_at: new Date().toISOString(),
      }

      // 只有当用户输入了新密钥时才更新
      if (s3_secret_key && s3_secret_key !== '******') {
        updateData.s3_secret_key = s3_secret_key
      }
      if (qiniu_secret_key && qiniu_secret_key !== '******') {
        updateData.qiniu_secret_key = qiniu_secret_key
      }

      const { data, error } = await client
        .from('storage_settings')
        .update(updateData)
        .eq('id', existing.id)
        .select()
        .single()

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        )
      }
      result = data
    } else {
      // 创建新配置
      const insertData = {
        storage_type,
        s3_endpoint: s3_endpoint || null,
        s3_bucket: s3_bucket || null,
        s3_access_key: s3_access_key || null,
        s3_secret_key: s3_secret_key || null,
        s3_region: s3_region || 'cn-beijing',
        s3_public_domain: s3_public_domain || null,
        qiniu_access_key: qiniu_access_key || null,
        qiniu_secret_key: qiniu_secret_key || null,
        qiniu_bucket: qiniu_bucket || null,
        qiniu_domain: qiniu_domain || null,
        qiniu_region: qiniu_region || 'z0',
        qiniu_is_private: qiniu_is_private || false,
        qiniu_public_domain: qiniu_public_domain || null,
        local_upload_dir: local_upload_dir || 'public/uploads',
        local_public_path: local_public_path || '/uploads',
        local_base_url: local_base_url || null,
        max_file_size: max_file_size || 10485760,
        allowed_extensions: allowed_extensions || ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        is_active: true,
      }

      const { data, error } = await client
        .from('storage_settings')
        .insert(insertData)
        .select()
        .single()

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        )
      }
      result = data
    }

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('更新存储配置错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
