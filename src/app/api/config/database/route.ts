import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseConfig, validateConfig, saveDatabaseConfig } from '@/lib/config/database-config';

/**
 * GET - 检查数据库是否已配置
 */
export async function GET() {
  const config = await getDatabaseConfig();

  return NextResponse.json({
    configured: !!config && !!config.supabaseUrl && !!config.supabaseAnonKey,
    config: config ? {
      supabaseUrl: config.supabaseUrl,
      siteUrl: config.siteUrl,
      siteName: config.siteName,
      // 不返回密钥
    } : null,
  });
}
