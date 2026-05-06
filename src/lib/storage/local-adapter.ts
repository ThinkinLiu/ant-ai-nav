/**
 * 本地存储适配器
 * 将文件存储在本地文件系统
 */

import { StorageAdapter, LocalConfig } from './types'
import fs from 'fs'
import path from 'path'

export class LocalStorageAdapter implements StorageAdapter {
  private config: LocalConfig
  private uploadDir: string
  private publicPath: string

  constructor(config: LocalConfig) {
    this.config = config
    this.uploadDir = path.resolve(process.cwd(), config.uploadDir)
    this.publicPath = config.publicPath

    // 确保上传目录存在
    this.ensureDirectoryExists(this.uploadDir)
  }

  /**
   * 确保目录存在，不存在则创建
   */
  private ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }
  }

  async uploadFile(fileContent: Buffer, fileName: string, contentType: string): Promise<string> {
    // 构建完整文件路径
    const filePath = path.join(this.uploadDir, fileName)

    // 确保子目录存在
    const subDir = path.dirname(filePath)
    this.ensureDirectoryExists(subDir)

    // 写入文件
    await fs.promises.writeFile(filePath, fileContent)

    // 返回相对路径（作为key）
    return fileName
  }

  async generatePresignedUrl(key: string, expireTime: number): Promise<string> {
    // 构建访问URL
    let baseUrl = this.config.baseUrl

    if (!baseUrl) {
      // 如果没有配置基础URL，使用公共路径
      baseUrl = this.publicPath
    }

    // 确保URL格式正确
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://') && !baseUrl.startsWith('/')) {
      baseUrl = '/' + baseUrl
    }

    // 移除末尾斜杠
    baseUrl = baseUrl.replace(/\/+$/, '')

    // 构建完整URL
    return `${baseUrl}/${key}`
  }

  getType() {
    return 'local' as const
  }
}
