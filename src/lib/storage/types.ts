/**
 * 存储适配器接口
 * 定义统一的文件上传和URL生成接口
 */
export interface StorageAdapter {
  /**
   * 上传文件
   * @param fileContent 文件内容 (Buffer)
   * @param fileName 文件名（包含路径）
   * @param contentType 内容类型
   */
  uploadFile(fileContent: Buffer, fileName: string, contentType: string): Promise<string>

  /**
   * 生成签名URL
   * @param key 文件key
   * @param expireTime 过期时间（秒）
   */
  generatePresignedUrl(key: string, expireTime: number): Promise<string>

  /**
   * 获取存储类型名称
   */
  getType(): StorageType
}

/**
 * 支持的存储类型
 */
export type StorageType = 's3' | 'qiniu' | 'local'

/**
 * S3 存储配置
 */
export interface S3Config {
  type: 's3'
  endpointUrl: string
  accessKey: string
  secretKey: string
  bucketName: string
  region?: string
  publicDomain?: string // 自定义域名/CDN域名
}

/**
 * 七牛云存储配置
 */
export interface QiniuConfig {
  type: 'qiniu'
  accessKey: string      // Access Key
  secretKey: string      // Secret Key
  bucketName: string      // 存储桶名称
  domain: string          // 七牛云绑定的域名（用于上传和签名）
  region?: string         // 区域，默认为 z0（华东）
  isPrivate?: boolean     // 是否为私有空间，默认 false（公共空间）
  publicDomain?: string   // 公共访问域名（用于实际访问，如 nginx 代理域名）
}

/**
 * 本地存储配置
 */
export interface LocalConfig {
  type: 'local'
  uploadDir: string       // 上传目录，默认为 public/uploads
  publicPath: string      // 公共访问路径
  baseUrl?: string        // 自定义基础URL
}

/**
 * 存储配置联合类型
 */
export type StorageConfig = S3Config | QiniuConfig | LocalConfig

/**
 * 获取存储配置
 * 支持从环境变量和直接配置两种方式
 */
export function getStorageConfig(): StorageConfig {
  // 从环境变量获取存储类型，默认为 s3
  const storageType = process.env.STORAGE_TYPE || 's3'

  switch (storageType) {
    case 'qiniu':
      return {
        type: 'qiniu',
        accessKey: process.env.QINIU_ACCESS_KEY || '',
        secretKey: process.env.QINIU_SECRET_KEY || '',
        bucketName: process.env.QINIU_BUCKET_NAME || '',
        domain: process.env.QINIU_DOMAIN || '',
        region: process.env.QINIU_REGION || 'z0',
        isPrivate: process.env.QINIU_IS_PRIVATE === 'true',
        publicDomain: process.env.QINIU_PUBLIC_DOMAIN,
      }

    case 'local':
      return {
        type: 'local',
        uploadDir: process.env.LOCAL_UPLOAD_DIR || 'public/uploads',
        publicPath: process.env.LOCAL_PUBLIC_PATH || '/uploads',
        baseUrl: process.env.LOCAL_BASE_URL,
      }

    case 's3':
    default:
      return {
        type: 's3',
        endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL || '',
        accessKey: process.env.COZE_BUCKET_ACCESS_KEY || '',
        secretKey: process.env.COZE_BUCKET_SECRET_KEY || '',
        bucketName: process.env.COZE_BUCKET_NAME || '',
        region: process.env.COZE_BUCKET_REGION || 'cn-beijing',
        publicDomain: process.env.COZE_BUCKET_PUBLIC_DOMAIN,
      }
  }
}
