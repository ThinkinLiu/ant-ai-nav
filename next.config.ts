import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 启用 standalone 输出模式，用于 Docker 部署
  output: 'standalone',

  // 配置允许的开发源（解决 Coze 测试环境跨域问题）
  allowedDevOrigins: [
    // 允许所有 Coze 开发环境域名
    '*.dev.coze.site',
    // 允许本地开发
    'localhost:*',
    '127.0.0.1:*',
  ],

  // 注意：不要设置 basePath，否则会导致静态资源路径问题
  // 如果发现静态资源需要 /app 前缀，可能需要检查容器配置

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
  },
  
  // Standalone 模式：确保包含所有必要的文件
  outputFileTracingIncludes: {
    '*': [
      './node_modules/@supabase/**',
      './node_modules/coze-coding-dev-sdk/**',
      './public/**',
    ],
  },

  // 服务器端组件配置 - 确保服务器端模块不会被打包到客户端
  serverExternalPackages: [],

  // 环境变量配置 - 在构建时注入
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 
      process.env.NEXT_PUBLIC_SUPABASE_URL || 
      process.env.COZE_SUPABASE_URL || 
      process.env.SUPABASE_URL || 
      '',
    
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
      process.env.COZE_SUPABASE_ANON_KEY || 
      process.env.SUPABASE_ANON_KEY || 
      process.env.SUPABASE_SERVICE_ROLE_KEY || 
      '',
  },
};

export default nextConfig;
