import { NextRequest, NextResponse } from 'next/server'
import { getStorage, validateStorageConfig, getStorageType } from '@/lib/storage'

// 图片文件上传
// 支持 JPG、PNG、GIF、WebP 格式
// 返回签名 URL（有效期 10 年）和文件 key
export async function POST(request: NextRequest) {
  try {
    // 验证存储配置
    const validation = validateStorageConfig()
    if (!validation.valid) {
      console.error('Storage config error:', validation.error)
      return NextResponse.json(
        { error: `存储服务配置不完整: ${validation.error}` },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'uploads'

    if (!file) {
      return NextResponse.json({ error: '未找到文件' }, { status: 400 })
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        error: '只支持 JPG、PNG、GIF、WebP 格式的图片'
      }, { status: 400 })
    }

    // 验证文件大小 (最大 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: '图片大小不能超过 5MB' }, { status: 400 })
    }

    // 转换文件为 Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // 生成文件名（使用原始文件名的安全版本）
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    // 确保扩展名合法
    const safeExt = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext) ? ext : 'jpg'
    const fileName = `${folder}/${timestamp}_${randomStr}.${safeExt}`

    console.log(`[${getStorageType()}] Uploading file:`, { fileName, contentType: file.type, size: file.size })

    // 获取存储实例并上传
    const storage = getStorage()
    const fileKey = await storage.uploadFile(buffer, fileName, file.type)

    console.log(`[${getStorageType()}] File uploaded, key:`, fileKey)

    // 生成签名 URL（有效期 10 年 = 315360000 秒）
    const signedUrl = await storage.generatePresignedUrl(fileKey, 315360000)

    return NextResponse.json({
      success: true,
      data: {
        url: signedUrl,
        key: fileKey,
        fileName,
        size: file.size,
        contentType: file.type,
        storageType: getStorageType(),
      },
    })
  } catch (error) {
    console.error('Upload failed:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `上传失败: ${errorMessage}` },
      { status: 500 }
    )
  }
}
