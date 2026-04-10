import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { isPlaceholderUrl, isPlaceholderKey } from '@/lib/env-config';

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
 * 在构建时如果环境变量不存在或为占位符，返回 null 而不是抛出错误
 */
function getSupabaseCredentials(): SupabaseCredentials | null {
  if (cachedCredentials) {
    return cachedCredentials;
  }

  // 尝试多个环境变量组合
  const candidates = [
    { url: process.env.NEXT_PUBLIC_SUPABASE_URL, key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
    { url: process.env.COZE_SUPABASE_URL, key: process.env.COZE_SUPABASE_ANON_KEY },
    { url: process.env.SUPABASE_URL, key: process.env.SUPABASE_ANON_KEY },
  ];

  for (const candidate of candidates) {
    if (candidate.url && candidate.key) {
      // 跳过占位符值
      if (isPlaceholderUrl(candidate.url) || isPlaceholderKey(candidate.key)) {
        continue;
      }
      cachedCredentials = { url: candidate.url, anonKey: candidate.key };
      return cachedCredentials;
    }
  }

  return null;
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
