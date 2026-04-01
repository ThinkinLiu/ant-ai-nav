import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseConfig } from '@/lib/config/database-config';

/**
 * 脱敏处理密钥
 */
function maskKey(key: string): string {
  if (!key || key.length < 10) return '***';
  return key.slice(0, 8) + '...' + key.slice(-8);
}

/**
 * GET - 检查数据库是否已配置
 */
export async function GET() {
  const config = await getDatabaseConfig();

  return NextResponse.json({
    configured: !!config && !!config.supabaseUrl && !!config.supabaseAnonKey,
    config: config ? {
      supabaseUrl: config.supabaseUrl,
      supabaseAnonKey: config.supabaseAnonKey ? maskKey(config.supabaseAnonKey) : '',
      supabaseServiceRoleKey: config.supabaseServiceRoleKey ? maskKey(config.supabaseServiceRoleKey) : '',
      siteUrl: config.siteUrl,
      siteName: config.siteName,
    } : null,
  });
}
