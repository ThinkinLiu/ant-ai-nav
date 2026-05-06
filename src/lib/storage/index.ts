/**
 * 存储服务工厂
 * 根据配置创建对应的存储适配器
 */

import { StorageAdapter, StorageConfig, getStorageConfig } from './types'
import { S3StorageAdapter } from './s3-adapter'
import { QiniuStorageAdapter } from './qiniu-adapter'
import { LocalStorageAdapter } from './local-adapter'

// 缓存存储实例
let storageInstance: StorageAdapter | null = null

/**
 * 创建存储适配器实例
 */
export function createStorage(config?: StorageConfig): StorageAdapter {
  const storageConfig = config || getStorageConfig()

  switch (storageConfig.type) {
    case 'qiniu':
      return new QiniuStorageAdapter(storageConfig)

    case 'local':
      return new LocalStorageAdapter(storageConfig)

    case 's3':
    default:
      return new S3StorageAdapter(storageConfig)
  }
}

/**
 * 获取存储实例（单例模式）
 */
export function getStorage(): StorageAdapter {
  if (!storageInstance) {
    storageInstance = createStorage()
  }
  return storageInstance
}

/**
 * 重置存储实例（用于测试或配置变更）
 */
export function resetStorage(): void {
  storageInstance = null
}

/**
 * 验证存储配置是否有效
 */
export function validateStorageConfig(config?: StorageConfig): { valid: boolean; error?: string } {
  const storageConfig = config || getStorageConfig()

  switch (storageConfig.type) {
    case 'qiniu':
      if (!storageConfig.accessKey) {
        return { valid: false, error: 'QINIU_ACCESS_KEY is not configured' }
      }
      if (!storageConfig.secretKey) {
        return { valid: false, error: 'QINIU_SECRET_KEY is not configured' }
      }
      if (!storageConfig.bucketName) {
        return { valid: false, error: 'QINIU_BUCKET_NAME is not configured' }
      }
      if (!storageConfig.domain) {
        return { valid: false, error: 'QINIU_DOMAIN is not configured' }
      }
      return { valid: true }

    case 'local':
      if (!storageConfig.uploadDir) {
        return { valid: false, error: 'LOCAL_UPLOAD_DIR is not configured' }
      }
      return { valid: true }

    case 's3':
    default:
      if (!storageConfig.endpointUrl) {
        return { valid: false, error: 'COZE_BUCKET_ENDPOINT_URL is not configured' }
      }
      if (!storageConfig.bucketName) {
        return { valid: false, error: 'COZE_BUCKET_NAME is not configured' }
      }
      return { valid: true }
  }
}

/**
 * 获取当前存储类型
 */
export function getStorageType(): string {
  return process.env.STORAGE_TYPE || 's3'
}

// 导出类型
export type { StorageAdapter, StorageConfig, StorageType } from './types'
export { S3StorageAdapter } from './s3-adapter'
export { QiniuStorageAdapter } from './qiniu-adapter'
export { LocalStorageAdapter } from './local-adapter'
