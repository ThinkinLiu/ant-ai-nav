import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase 客户端配置
 * 
 * 支持两种环境变量命名方式：
 * 1. NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY (推荐，标准 Next.js 命名)
 * 2. COZE_SUPABASE_URL / COZE_SUPABASE_ANON_KEY (兼容旧配置)
 */

interface SupabaseCredentials {
  url: string;
  anonKey: string;
}

function getSupabaseCredentials(): SupabaseCredentials {
  // 优先使用标准环境变量，其次使用兼容的环境变量
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.COZE_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.COZE_SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL is not set. Please set it in your .env.local file.'
    );
  }
  if (!anonKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_ANON_KEY is not set. Please set it in your .env.local file.'
    );
  }

  return { url, anonKey };
}

/**
 * 获取 Supabase 客户端
 * @param token - 可选的用户认证 token，用于需要用户权限的操作
 * @returns Supabase 客户端实例
 */
function getSupabaseClient(token?: string): SupabaseClient {
  const { url, anonKey } = getSupabaseCredentials();

  if (token) {
    return createClient(url, anonKey, {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
      db: {
        timeout: 60000,
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return createClient(url, anonKey, {
    db: {
      timeout: 60000,
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export { getSupabaseCredentials, getSupabaseClient };
