/**
 * 存储服务工厂
 * 根据配置创建对应的存储适配器
 */

import { StorageAdapter, StorageConfig, StorageType, getStorageConfig } from './types'
import { S3StorageAdapter } from './s3-adapter'
import { QiniuStorageAdapter } from './qiniu-adapter'
import { LocalStorageAdapter } from './local-adapter'
import { createClient } from '@supabase/supabase-js'

// 缓存存储实例
let storageInstance: StorageAdapter | null = null
let cachedConfig: StorageConfig | null = null

// 获取 Supabase 客户端（用于读取数据库配置）
function getSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    return null
  }
  
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

/**
 * 从数据库加载存储配置
 */
export async function loadStorageConfigFromDatabase(): Promise<StorageConfig | null> {
  try {
    const supabase = getSupabaseAdminClient()
    if (!supabase) {
      console.log('[Storage] Supabase client not available')
      return null
    }
    
    const { data, error } = await supabase
      .from('storage_settings')
      .select('*')
      .eq('is_active', true)
      .single()
    
    if (error || !data) {
      console.log('[Storage] No active storage config found in database')
      return null
    }
    
    // 根据存储类型构建配置
    const config: StorageConfig = {
      type: data.storage_type as StorageType,
      endpointUrl: data.s3_endpoint || undefined,
      bucketName: data.s3_bucket || data.qiniu_bucket || undefined,
      accessKey: data.s3_access_key || data.qiniu_access_key || undefined,
      secretKey: data.s3_secret_key || data.qiniu_secret_key || undefined,
      region: data.s3_region || data.qiniu_region || undefined,
      domain: data.s3_public_domain || data.qiniu_domain || undefined,
      uploadDir: data.local_upload_dir || undefined,
      publicPath: data.local_public_path || undefined,
      baseUrl: data.local_base_url || undefined,
    }
    
    console.log('[Storage] Loaded config from database, type:', data.storage_type)
    return config
  } catch (error) {
    console.error('[Storage] Failed to load config from database:', error)
    return null
  }
}

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
 * 获取存储实例（单例模式）- 优先使用数据库配置
 */
export async function getStorage(): Promise<StorageAdapter> {
  if (!storageInstance || !cachedConfig) {
    // 优先尝试从数据库加载配置
    const dbConfig = await loadStorageConfigFromDatabase()
    
    if (dbConfig) {
      cachedConfig = dbConfig
      storageInstance = createStorage(dbConfig)
    } else {
      // 回退到环境变量配置
      cachedConfig = getStorageConfig()
      storageInstance = createStorage(cachedConfig)
    }
  }
  return storageInstance
}

/**
 * 获取存储实例（同步版本，仅使用环境变量）
 */
export function getStorageSync(): StorageAdapter {
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
  cachedConfig = null
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
  return cachedConfig?.type || process.env.STORAGE_TYPE || 's3'
}

// 导出类型
export type { StorageAdapter, StorageConfig, StorageType } from './types'
export { S3StorageAdapter } from './s3-adapter'
export { QiniuStorageAdapter } from './qiniu-adapter'
export { LocalStorageAdapter } from './local-adapter'
