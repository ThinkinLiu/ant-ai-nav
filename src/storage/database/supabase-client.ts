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

  // 调试日志：在服务端渲染时记录环境变量状态
  if (typeof window === 'undefined') {
    console.log('[Supabase] 检查环境变量配置:');
    console.log('  NEXT_PUBLIC_SUPABASE_URL:', candidates[0].url ? '已设置' : '未设置');
    console.log('  COZE_SUPABASE_URL:', candidates[1].url ? '已设置' : '未设置');
    console.log('  SUPABASE_URL:', candidates[2].url ? '已设置' : '未设置');
    console.log('  NODE_ENV:', process.env.NODE_ENV);
  }

  for (const candidate of candidates) {
    if (candidate.url && candidate.key) {
      // 跳过占位符值
      if (isPlaceholderUrl(candidate.url) || isPlaceholderKey(candidate.key)) {
        console.log('[Supabase] 跳过占位符值:', candidate.url);
        continue;
      }
      cachedCredentials = { url: candidate.url, anonKey: candidate.key };
      console.log('[Supabase] 成功加载 Supabase 配置');
      return cachedCredentials;
    }
  }

  console.log('[Supabase] 未找到有效的 Supabase 配置');
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
