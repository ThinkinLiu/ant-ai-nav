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
   * URL Safe Base64 编码
   * 七牛云要求使用 URL Safe 格式的 Base64
   */
  private urlSafeBase64(str: string): string {
    return Buffer.from(str)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
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

    // 计算 URL Safe Base64 编码的策略
    const encodedPolicy = this.urlSafeBase64(policy)

    // 使用 HMAC-SHA1 计算签名
    const signature = crypto
      .createHmac('sha1', secretKey)
      .update(encodedPolicy)
      .digest('base64')
      // 签名也需要 URL Safe 编码
      .replace(/\+/g, '-')
      .replace(/\//g, '_')

    // 拼接上传凭证: AccessKey:EncodedSign:EncodedPolicy
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
    // 签名时必须使用七牛云绑定的域名（签名验证依赖 Host）
    let signDomain = this.config.domain
    if (!signDomain.startsWith('http://') && !signDomain.startsWith('https://')) {
      signDomain = 'https://' + signDomain
    }

    // 公共访问时使用的域名（通过 nginx 代理访问）
    let accessDomain = this.config.publicDomain || this.config.domain
    if (!accessDomain.startsWith('http://') && !accessDomain.startsWith('https://')) {
      accessDomain = 'https://' + accessDomain
    }

    // 如果是公共空间，直接返回访问 URL（无需签名）
    const isPrivate = this.config.isPrivate || false
    
    if (!isPrivate) {
      // 公共空间直接返回访问 URL
      return `${accessDomain}/${key}`
    }

    // 私有空间需要生成下载凭证
    // 文档: https://developer.qiniu.com/kodo/1202/download-token
    const deadline = Math.floor(Date.now() / 1000) + expireTime
    
    // 构造待签名字符串: 使用绑定域名生成签名（七牛云会验证 Host）
    const signedStr = `${signDomain}/${key}?e=${deadline}`
    
    // 使用 HMAC-SHA1 签名
    const signature = crypto
      .createHmac('sha1', this.config.secretKey)
      .update(signedStr)
      .digest('base64')
      // 转换为 URL Safe 格式
      .replace(/\+/g, '-')
      .replace(/\//g, '_')

    // 拼接下载凭证: AccessKey:encoded_signature
    const downloadToken = `${this.config.accessKey}:${signature}`

    // 最终返回访问 URL（使用公共访问域名，但签名参数保持不变）
    // 关键点：nginx 代理时需要设置 proxy_set_header Host img.mayiai.site;
    // 这样七牛云才能正确验证签名
    return `${accessDomain}/${key}?e=${deadline}&token=${downloadToken}`
  }

  getType() {
    return 'qiniu' as const
  }
}
