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
  },
  
  // 生产环境优化
  poweredByHeader: false,
  
  // 严格模式
  reactStrictMode: true,
  
  // 构建优化
  typescript: {
    // 生产构建时跳过类型检查，加快构建速度
    ignoreBuildErrors: true,
  },
  
  // 环境变量配置 - 在构建时注入
  // 支持多种环境变量命名方式，确保 Coze 环境和独立服务器环境都能正常工作
  env: {
    // Supabase URL - 支持多种命名方式
    NEXT_PUBLIC_SUPABASE_URL: 
      process.env.NEXT_PUBLIC_SUPABASE_URL || 
      process.env.COZE_SUPABASE_URL || 
      process.env.SUPABASE_URL || 
      '',
    
    // Supabase Anon Key - 支持多种命名方式
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
      process.env.COZE_SUPABASE_ANON_KEY || 
      process.env.SUPABASE_ANON_KEY || 
      process.env.SUPABASE_SERVICE_ROLE_KEY || 
      '',
  },
};

export default nextConfig;
