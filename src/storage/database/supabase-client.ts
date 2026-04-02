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

// 缓存凭据
let cachedCredentials: SupabaseCredentials | null = null;

/**
 * 获取 Supabase 凭据
 * 在构建时如果环境变量不存在，返回 null 而不是抛出错误
 */
function getSupabaseCredentials(): SupabaseCredentials | null {
  if (cachedCredentials) {
    return cachedCredentials;
  }

  // 优先使用标准环境变量，其次使用兼容的环境变量
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.COZE_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.COZE_SUPABASE_ANON_KEY;

  // 在构建时如果环境变量不存在，返回 null
  if (!url || !anonKey) {
    return null;
  }

  cachedCredentials = { url, anonKey };
  return cachedCredentials;
}

/**
 * 检查 Supabase 是否已配置
 */
export function isSupabaseConfigured(): boolean {
  return getSupabaseCredentials() !== null;
}

/**
 * 获取 Supabase 客户端
 * @param token - 可选的用户认证 token，用于需要用户权限的操作
 * @returns Supabase 客户端实例
 * @throws 如果环境变量未配置则抛出错误（运行时）
 */
function getSupabaseClient(token?: string): SupabaseClient {
  const credentials = getSupabaseCredentials();

  if (!credentials) {
    throw new Error(
      'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.'
    );
  }

  const { url, anonKey } = credentials;

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

/**
 * 尝试获取 Supabase 客户端，不抛出错误
 * 用于构建时的静态生成
 */
function tryGetSupabaseClient(): SupabaseClient | null {
  try {
    return getSupabaseClient();
  } catch {
    return null;
  }
}

export { getSupabaseCredentials, getSupabaseClient, tryGetSupabaseClient };
