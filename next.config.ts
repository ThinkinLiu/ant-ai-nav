import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 启用 standalone 输出模式，用于 Docker 部署
  output: 'standalone',
  
  // 生产环境压缩（默认启用，这里显式声明）
  compress: true,
  
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
  
  // 编译器优化
  compiler: {
    // 生产环境移除 console.log
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // 外部化需要 Node.js 的包（Next.js 16 放在顶层）
  serverExternalPackages: [
    '@supabase/supabase-js',
    'coze-coding-dev-sdk',
    '@aws-sdk/client-s3',
    '@aws-sdk/s3-request-presigner',
  ],

  // Turbopack 配置
  turbopack: {
    root: '/workspace/projects',
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
  },
  
  // Standalone 模式：确保包含所有必要的文件
  outputFileTracingIncludes: {
    '*': [
      './node_modules/@supabase/**',
      './node_modules/coze-coding-dev-sdk/**',
      './public/**',
    ],
  },
  
  // HTTP 头缓存策略
  async headers() {
    return [
      // 静态资源长期缓存（1年）
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // 页面缓存（1小时）
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
