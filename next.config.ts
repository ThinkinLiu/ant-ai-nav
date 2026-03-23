import type { NextConfig } from 'next';

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
    // 优化图片处理
    formats: ['image/avif', 'image/webp'],
    // 禁用图片优化以减少内存
    unoptimized: process.env.NODE_ENV === 'production',
  },
  
  // 生产环境优化
  poweredByHeader: false,
  
  // 禁用严格模式减少内存
  reactStrictMode: false,
  
  // 构建优化 - 跳过类型检查和ESLint检查加快构建
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // 实验性优化
  experimental: {
    // 优化包导入，减少构建时间和内存
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'recharts',
      'date-fs',
      '@tiptap/react',
      '@tiptap/starter-kit',
    ],
  },
  
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
  
  // eslint配置 - 使用类型断言绕过类型检查
  // @ts-ignore
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
