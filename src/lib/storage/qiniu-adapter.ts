/**
 * 七牛云存储适配器
 * 使用七牛云官方 API 上传文件
 */

import { StorageAdapter, QiniuConfig } from './types'
import crypto from 'crypto'

export class QiniuStorageAdapter implements StorageAdapter {
  private config: QiniuConfig

  constructor(config: QiniuConfig) {
    this.config = config
  }

  /**
   * 生成七牛云上传凭证
   * 凭证有效期为 1 小时
   */
  private generateUploadToken(): string {
    const accessKey = this.config.accessKey
    const secretKey = this.config.secretKey
    const bucket = this.config.bucketName

    // 设置凭证有效期（1小时）
    const deadline = Math.floor(Date.now() / 1000) + 3600

    // 构造上传策略
    const policy = JSON.stringify({
      scope: bucket,
      deadline,
    })

    // 计算签名
    const encodedPolicy = Buffer.from(policy).toString('base64')
    const signature = crypto
      .createHmac('sha1', secretKey)
      .update(encodedPolicy)
      .digest('base64')

    // 拼接 AccessKey:Signature
    return `${accessKey}:${signature}:${encodedPolicy}`
  }

  async uploadFile(fileContent: Buffer, fileName: string, contentType: string): Promise<string> {
    const uploadToken = this.generateUploadToken()

    // 构建上传表单数据
    const formData = new FormData()
    formData.append('token', uploadToken)
    formData.append('key', fileName)
    // 将 Buffer 转换为 Uint8Array 后再转为 Blob
    const uint8Array = new Uint8Array(fileContent)
    formData.append('file', new Blob([uint8Array], { type: contentType }), fileName)

    // 选择上传服务器
    const uploadServer = this.getUploadServer()

    const response = await fetch(uploadServer, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`七牛云上传失败: ${response.status} - ${errorText}`)
    }

    const result = await response.json()

    if (result.error) {
      throw new Error(`七牛云上传失败: ${result.error}`)
    }

    // 返回文件 key
    return result.key || fileName
  }

  /**
   * 获取上传服务器地址
   * 根据区域选择不同的上传地址
   */
  private getUploadServer(): string {
    const servers: Record<string, string> = {
      z0: 'https://upload.qiniup.com',
      z1: 'https://upload-z1.qiniup.com',
      z2: 'https://upload-z2.qiniup.com',
      na0: 'https://upload-na0.qiniup.com',
      as0: 'https://upload-as0.qiniup.com',
    }

    return servers[this.config.region || 'z0'] || servers.z0
  }

  async generatePresignedUrl(key: string, expireTime: number): Promise<string> {
    // 七牛云的公共bucket可以直接使用域名访问
    // 对于私有bucket，需要生成下载凭证

    // 构建基础URL
    let baseUrl = this.config.domain
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      baseUrl = 'https://' + baseUrl
    }

    const url = `${baseUrl}/${key}`

    // 检查是否需要生成下载凭证
    const deadline = Math.floor(Date.now() / 1000) + expireTime
    const encodedUrl = Buffer.from(url).toString('base64url')
    const signedStr = `${url}\n${deadline}`
    const signature = crypto
      .createHmac('sha1', this.config.secretKey)
      .update(signedStr)
      .digest('base64url')

    return `${url}?e=${deadline}&token=${this.config.accessKey}:${signature}`
  }

  getType() {
    return 'qiniu' as const
  }
}
