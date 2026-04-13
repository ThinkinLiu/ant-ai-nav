/**
 * 环境检测和配置验证工具
 * 统一使用 NEXT_PUBLIC_ 前缀的环境变量
 */

/**
 * 环境类型
 */
export type Environment = 'coze' | 'standalone' | 'development';

/**
 * 检测当前运行环境
 */
export function detectEnvironment(): Environment {
  // 检查是否在 Coze 环境中
  // Coze 环境通常会有 COZE_WORKSPACE_PATH 或 COZE_ 开头的环境变量
  if (process.env.COZE_WORKSPACE_PATH || 
      process.env.COZE_INTEGRATION_BASE_URL ||
      process.env.VERCEL) {
    return 'coze';
  }
  
  // 检查是否在生产环境
  if (process.env.NODE_ENV === 'production') {
    return 'standalone';
  }
  
  // 默认为开发环境
  return 'development';
}

/**
 * 检测 URL 是否为占位符
 * 只检测明显的占位符模式
 */
export function isPlaceholderUrl(url: string | undefined): boolean {
  if (!url) return true;
  // 检测明显的占位符模式
  const lowerUrl = url.toLowerCase();
  return (
    // 包含 <project-ref> 格式（如 <your-project-ref>）
    (lowerUrl.includes('<') && lowerUrl.includes('>')) ||
    // 包含 your-project-id 且后面跟着明显占位符
    (lowerUrl.includes('your-project-id')) ||
    // 包含 your-project 且在 .supabase.co 域名中（表示未替换的模板）
    (lowerUrl.includes('your-project') && lowerUrl.includes('.supabase.co')) ||
    // placeholder.supabase.co 是默认占位符
    (lowerUrl.includes('placeholder.supabase.co')) ||
    // localhost 开发环境
    (url === 'http://localhost' || url.startsWith('http://localhost:')) ||
    (url === 'http://127.0.0.1' || url.startsWith('http://127.0.0.1:'))
  );
}

/**
 * 检测密钥是否为占位符
 * 只检测明显的占位符模式
 */
export function isPlaceholderKey(key: string | undefined): boolean {
  if (!key) return true;
  // 检测明显的占位符模式
  return key.includes('placeholder') || 
         key.includes('your-anon') ||
         key.includes('your-') ||
         key === 'placeholder-anon-key' ||
         // 跳过无效的 "eyJ" 前缀（没有三个点分隔的 JWT 格式是无效的）
         (key.startsWith('eyJ') && key.split('.').length !== 3);
}

/**
 * 获取环境变量
 * @param key - 环境变量名称
 * @param fallbackKey - 备选环境变量名称（可选）
 * @param defaultValue - 默认值
 * @param skipPlaceholder - 是否跳过占位符值
 */
export function getEnv(
  key: string, 
  fallbackKey?: string, 
  defaultValue?: string | boolean,
  skipPlaceholder?: boolean
): string | undefined {
  // 获取主环境变量
  let value = process.env[key];
  
  // 如果主环境变量不存在或为空，尝试备选环境变量
  if (!value && fallbackKey) {
    value = process.env[fallbackKey];
  }
  
  if (value) {
    // 如果启用了跳过占位符，且当前值是占位符，则返回默认值
    if (skipPlaceholder) {
      if (isPlaceholderUrl(value) || isPlaceholderKey(value)) {
        return defaultValue as string | undefined;
      }
    }
    return value;
  }
  
  return defaultValue as string | undefined;
}

/**
 * 必需的环境变量配置
 */
export interface RequiredEnvConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

/**
 * 可选的环境变量配置
 */
export interface OptionalEnvConfig {
  cozeApiKey?: string;
  cozeClientId?: string;
  cozeClientSecret?: string;
  cozeBaseUrl?: string;
  s3AccessKeyId?: string;
  s3SecretAccessKey?: string;
  s3BucketName?: string;
  s3Region?: string;
  s3Endpoint?: string;
}

/**
 * 环境变量验证结果
 */
export interface EnvValidationResult {
  isValid: boolean;
  missing: string[];
  warnings: string[];
  environment: Environment;
  config?: RequiredEnvConfig & OptionalEnvConfig;
}

/**
 * 验证必需的环境变量
 */
export function validateEnv(): EnvValidationResult {
  const environment = detectEnvironment();
  const missing: string[] = [];
  const warnings: string[] = [];
  
  // 检查必需的环境变量（自动跳过占位符，支持 COZE_ 前缀作为备选）
  const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL', 'COZE_SUPABASE_URL', undefined, true);
  const supabaseAnonKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'COZE_SUPABASE_ANON_KEY', undefined, true);
  
  if (!supabaseUrl) {
    missing.push('NEXT_PUBLIC_SUPABASE_URL 或 COZE_SUPABASE_URL');
  }
  
  if (!supabaseAnonKey) {
    missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY 或 COZE_SUPABASE_ANON_KEY');
  }
  
  // 检查可选的环境变量
  const cozeApiKey = getEnv('COZE_WORKLOAD_IDENTITY_API_KEY') || getEnv('COZE_API_KEY');
  if (!cozeApiKey && environment === 'coze') {
    warnings.push('COZE API 配置缺失，AI 生成功能可能不可用');
  }
  
  const s3Config = {
    s3AccessKeyId: getEnv('S3_ACCESS_KEY_ID') || getEnv('AWS_ACCESS_KEY_ID'),
    s3SecretAccessKey: getEnv('S3_SECRET_ACCESS_KEY') || getEnv('AWS_SECRET_ACCESS_KEY'),
    s3BucketName: getEnv('S3_BUCKET_NAME') || getEnv('AWS_S3_BUCKET'),
    s3Region: getEnv('S3_REGION') || getEnv('AWS_REGION'),
    s3Endpoint: getEnv('S3_ENDPOINT') || getEnv('AWS_ENDPOINT_URL_S3'),
  };
  
  // 检查 S3 配置的完整性
  const hasS3Config = Object.values(s3Config).some(v => v);
  if (hasS3Config) {
    const missingS3 = [];
    if (!s3Config.s3AccessKeyId) missingS3.push('S3_ACCESS_KEY_ID');
    if (!s3Config.s3SecretAccessKey) missingS3.push('S3_SECRET_ACCESS_KEY');
    if (!s3Config.s3BucketName) missingS3.push('S3_BUCKET_NAME');
    
    if (missingS3.length > 0) {
      warnings.push(`S3 配置不完整，缺少: ${missingS3.join(', ')}`);
    }
  }
  
  const isValid = missing.length === 0;
  
  const config = isValid ? {
    supabaseUrl: supabaseUrl!,
    supabaseAnonKey: supabaseAnonKey!,
    cozeApiKey,
    cozeClientId: getEnv('COZE_WORKLOAD_IDENTITY_CLIENT_ID') || getEnv('COZE_CLIENT_ID'),
    cozeClientSecret: getEnv('COZE_WORKLOAD_IDENTITY_CLIENT_SECRET') || getEnv('COZE_CLIENT_SECRET'),
    cozeBaseUrl: getEnv('COZE_INTEGRATION_BASE_URL') || getEnv('COZE_BASE_URL', 'https://integration.coze.cn'),
    ...s3Config,
  } : undefined;
  
  return {
    isValid,
    missing,
    warnings,
    environment,
    config,
  };
}

/**
 * 生成环境变量配置说明
 */
export function generateEnvHelp(): string {
  const environment = detectEnvironment();
  const lines = [
    '# 环境变量配置说明',
    '',
    `## 当前环境: ${environment}`,
    '',
    '## 必需的环境变量',
    '',
    '### Supabase 数据库配置',
    '```bash',
    'NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key',
    '```',
    '',
    '## 可选的环境变量',
    '',
    '### Coze API 配置 (AI 功能)',
    '```bash',
    'COZE_WORKLOAD_IDENTITY_API_KEY=your-api-key',
    'COZE_WORKLOAD_IDENTITY_CLIENT_ID=your-client-id',
    'COZE_WORKLOAD_IDENTITY_CLIENT_SECRET=your-client-secret',
    '```',
    '',
    '### S3 存储配置 (文件上传)',
    '```bash',
    'S3_ACCESS_KEY_ID=your-access-key',
    'S3_SECRET_ACCESS_KEY=your-secret-key',
    'S3_BUCKET_NAME=your-bucket-name',
    'S3_REGION=auto',
    'S3_ENDPOINT=https://your-s3-endpoint.com',
    '```',
  ];
  
  return lines.join('\n');
}
