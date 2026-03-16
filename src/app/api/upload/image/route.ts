import { NextRequest, NextResponse } from 'next/server'
import { S3Storage } from 'coze-coding-dev-sdk'

// 初始化 S3 存储
const storage = new S3Storage({
  endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
  accessKey: '',
  secretKey: '',
  bucketName: process.env.COZE_BUCKET_NAME,
  region: 'cn-beijing',
})

// 图片文件上传
// 支持 JPG、PNG、GIF、WebP 格式
// 返回签名 URL（有效期 10 年）和文件 key
export async function POST(request: NextRequest) {
  try {
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

    // 上传到对象存储
    const fileKey = await storage.uploadFile({
      fileContent: buffer,
      fileName,
      contentType: file.type,
    })

    // 生成签名 URL（有效期 10 年 = 315360000 秒）
    // 这确保了上传的图片链接几乎永久有效
    const signedUrl = await storage.generatePresignedUrl({
      key: fileKey,
      expireTime: 315360000, // 10 年
    })

    return NextResponse.json({
      success: true,
      data: {
        url: signedUrl,
        key: fileKey,
        fileName,
        size: file.size,
        contentType: file.type,
      },
    })
  } catch (error) {
    console.error('上传失败:', error)
    return NextResponse.json(
      { error: '上传失败，请重试' },
      { status: 500 }
    )
  }
}
