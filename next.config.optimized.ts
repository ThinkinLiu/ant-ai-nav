import type { NextConfig } from 'next';

/**
 * 检测值是否为占位符
 */
function isPlaceholder(value: string | undefined): boolean {
  if (!value) return true;
  return value.includes('placeholder') || 
         value.includes('your-') ||
         value === 'https://placeholder.supabase.co' ||
         value === 'placeholder-anon-key';
}

/**
 * 获取非占位符的环境变量值
 */
function getEnvValue(...values: (string | undefined)[]): string {
  for (const value of values) {
    if (value && !isPlaceholder(value)) {
      return value;
    }
  }
  // 如果所有值都是占位符，返回最后一个非空值（避免完全为空）
  for (const value of values) {
    if (value) {
      return value;
    }
  }
  return '';
}

const nextConfig: NextConfig = {
  // 启用 standalone 输出模式，用于 Docker 部署
  output: 'standalone',

  // 图片配置
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // 禁用图片优化以减少内存占用
    unoptimized: true,
  },

  // 生产环境优化
  poweredByHeader: false,

  // 禁用严格模式减少内存
  reactStrictMode: false,

  // 构建优化 - 跳过类型检查加快构建
  typescript: {
    ignoreBuildErrors: true,
  },

  // ESLint 优化
  eslint: {
    ignoreDuringBuilds: true,  // 构建时跳过 ESLint 检查
  },

  // 实验性优化
  experimental: {
    // 优化包导入，减少构建时间和内存
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'date-fns',
      'sonner',
    ],
    // 禁用 CSS 优化（避免 critters 依赖问题）
    optimizeCss: false,
    // 并行构建优化
    workerThreads: false,  // 禁用worker threads以减少内存占用
    cpus: 1,  // 限制CPU使用，减少资源竞争
  },

  // Standalone 模式：确保包含所有必要的文件
  outputFileTracingIncludes: {
    '*': [
      './node_modules/@supabase/**',
      './node_modules/coze-coding-dev-sdk/**',
      './public/**',
    ],
  },
};

export default nextConfig;
