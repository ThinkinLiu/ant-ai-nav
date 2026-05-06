/**
 * S3 兼容存储适配器
 * 支持 AWS S3、MinIO、阿里云 OSS、腾讯云 COS 等兼容 S3 协议的对象存储
 */

import { S3Storage } from 'coze-coding-dev-sdk'
import { StorageAdapter, S3Config } from './types'

export class S3StorageAdapter implements StorageAdapter {
  private client: S3Storage
  private config: S3Config

  constructor(config: S3Config) {
    this.config = config
    this.client = new S3Storage({
      endpointUrl: config.endpointUrl,
      accessKey: config.accessKey,
      secretKey: config.secretKey,
      bucketName: config.bucketName,
      region: config.region || 'cn-beijing',
    })
  }

  async uploadFile(fileContent: Buffer, fileName: string, contentType: string): Promise<string> {
    return await this.client.uploadFile({
      fileContent,
      fileName,
      contentType,
    })
  }

  async generatePresignedUrl(key: string, expireTime: number): Promise<string> {
    // 如果配置了自定义域名/CDN域名，使用自定义域名
    if (this.config.publicDomain) {
      // 确保域名格式正确
      let baseUrl = this.config.publicDomain
      if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
        baseUrl = 'https://' + baseUrl
      }
      // 移除末尾斜杠
      baseUrl = baseUrl.replace(/\/+$/, '')
      // 构建URL（对于CDN，通常不需要签名）
      return `${baseUrl}/${key}`
    }

    // 否则使用SDK生成的签名URL
    return await this.client.generatePresignedUrl({
      key,
      expireTime,
    })
  }

  getType() {
    return 's3' as const
  }
}
