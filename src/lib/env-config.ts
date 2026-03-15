/**
 * 环境检测和配置验证工具
 * 支持 Coze 环境和独立服务器环境的兼容部署
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
 * 获取环境变量，支持多种命名方式
 * @param keys - 环境变量名称列表（按优先级排序）
 * @param defaultValue - 默认值
 */
export function getEnv(keys: string | string[], defaultValue?: string): string | undefined {
  const keyList = Array.isArray(keys) ? keys : [keys];
  
  for (const key of keyList) {
    const value = process.env[key];
    if (value) {
      return value;
    }
  }
  
  return defaultValue;
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
 * 环境变量名称映射（支持多种命名方式）
 */
export const ENV_KEY_MAPPING = {
  supabaseUrl: [
    'NEXT_PUBLIC_SUPABASE_URL',
    'COZE_SUPABASE_URL',
    'SUPABASE_URL',
  ],
  supabaseAnonKey: [
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'COZE_SUPABASE_ANON_KEY',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ],
  cozeApiKey: [
    'COZE_WORKLOAD_IDENTITY_API_KEY',
    'COZE_API_KEY',
  ],
  cozeClientId: [
    'COZE_WORKLOAD_IDENTITY_CLIENT_ID',
    'COZE_CLIENT_ID',
  ],
  cozeClientSecret: [
    'COZE_WORKLOAD_IDENTITY_CLIENT_SECRET',
    'COZE_CLIENT_SECRET',
  ],
  cozeBaseUrl: [
    'COZE_INTEGRATION_BASE_URL',
    'COZE_BASE_URL',
  ],
  s3AccessKeyId: [
    'S3_ACCESS_KEY_ID',
    'AWS_ACCESS_KEY_ID',
  ],
  s3SecretAccessKey: [
    'S3_SECRET_ACCESS_KEY',
    'AWS_SECRET_ACCESS_KEY',
  ],
  s3BucketName: [
    'S3_BUCKET_NAME',
    'AWS_S3_BUCKET',
  ],
  s3Region: [
    'S3_REGION',
    'AWS_REGION',
  ],
  s3Endpoint: [
    'S3_ENDPOINT',
    'AWS_ENDPOINT_URL_S3',
  ],
};

/**
 * 验证必需的环境变量
 */
export function validateEnv(): EnvValidationResult {
  const environment = detectEnvironment();
  const missing: string[] = [];
  const warnings: string[] = [];
  
  // 检查必需的环境变量
  const supabaseUrl = getEnv(ENV_KEY_MAPPING.supabaseUrl);
  const supabaseAnonKey = getEnv(ENV_KEY_MAPPING.supabaseAnonKey);
  
  if (!supabaseUrl) {
    missing.push('NEXT_PUBLIC_SUPABASE_URL 或 COZE_SUPABASE_URL');
  }
  
  if (!supabaseAnonKey) {
    missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY 或 COZE_SUPABASE_ANON_KEY');
  }
  
  // 检查可选的环境变量
  const cozeApiKey = getEnv(ENV_KEY_MAPPING.cozeApiKey);
  if (!cozeApiKey && environment === 'coze') {
    warnings.push('COZE API 配置缺失，AI 生成功能可能不可用');
  }
  
  const s3Config = {
    s3AccessKeyId: getEnv(ENV_KEY_MAPPING.s3AccessKeyId),
    s3SecretAccessKey: getEnv(ENV_KEY_MAPPING.s3SecretAccessKey),
    s3BucketName: getEnv(ENV_KEY_MAPPING.s3BucketName),
    s3Region: getEnv(ENV_KEY_MAPPING.s3Region),
    s3Endpoint: getEnv(ENV_KEY_MAPPING.s3Endpoint),
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
    cozeClientId: getEnv(ENV_KEY_MAPPING.cozeClientId),
    cozeClientSecret: getEnv(ENV_KEY_MAPPING.cozeClientSecret),
    cozeBaseUrl: getEnv(ENV_KEY_MAPPING.cozeBaseUrl, 'https://integration.coze.cn'),
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
    '# 方式 1: 标准命名 (推荐)',
    'NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key',
    '',
    '# 方式 2: Coze 环境命名',
    'COZE_SUPABASE_URL=https://your-project.supabase.co',
    'COZE_SUPABASE_ANON_KEY=your-anon-key',
    '',
    '# 方式 3: 通用命名',
    'SUPABASE_URL=https://your-project.supabase.co',
    'SUPABASE_ANON_KEY=your-anon-key',
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
    '',
    '## 获取帮助',
    '',
    '- Supabase 文档: https://supabase.com/docs',
    '- Coze 平台: https://www.coze.cn',
    '- 项目 README: 查看 README.md 了解更多信息',
  ];
  
  return lines.join('\n');
}

/**
 * 打印环境变量验证结果
 */
export function printEnvStatus(): void {
  const result = validateEnv();
  
  console.log('\n========================================');
  console.log('环境变量配置检查');
  console.log('========================================\n');
  
  console.log(`当前环境: ${result.environment}`);
  console.log(`配置状态: ${result.isValid ? '✅ 有效' : '❌ 无效'}\n`);
  
  if (result.missing.length > 0) {
    console.log('❌ 缺少必需的环境变量:');
    result.missing.forEach(item => {
      console.log(`  - ${item}`);
    });
    console.log('');
  }
  
  if (result.warnings.length > 0) {
    console.log('⚠️  警告:');
    result.warnings.forEach(item => {
      console.log(`  - ${item}`);
    });
    console.log('');
  }
  
  if (!result.isValid) {
    console.log('📝 请配置环境变量后重试。查看以下文档获取帮助:');
    console.log('  - docs/deployment-guide.md');
    console.log('  - README.md');
    console.log('\n或者运行以下命令查看配置说明:');
    console.log('  pnpm tsx scripts/check-env.ts --help\n');
  }
  
  console.log('========================================\n');
}

// 导出默认配置
export default {
  detectEnvironment,
  validateEnv,
  getEnv,
  generateEnvHelp,
  printEnvStatus,
  ENV_KEY_MAPPING,
};
