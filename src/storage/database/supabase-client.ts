import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase 客户端配置
 *
 * 支持多种配置方式：
 * 1. 环境变量（NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY）
 * 2. COZE 环境变量（COZE_SUPABASE_URL / COZE_SUPABASE_ANON_KEY）
 * 3. 运行时配置文件（/app/config/database.json） - 仅服务器端
 */

interface SupabaseCredentials {
  url: string;
  anonKey: string;
}

// 缓存凭据
let cachedCredentials: SupabaseCredentials | null = null;
let checkedRuntimeConfig = false;

/**
 * 获取 Supabase 凭据
 * 在构建时如果环境变量不存在，返回 null 而不是抛出错误
 */
function getSupabaseCredentialsFromEnv(): SupabaseCredentials | null {
  // 优先使用标准环境变量，其次使用兼容的环境变量
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.COZE_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.COZE_SUPABASE_ANON_KEY;

  // 在构建时如果环境变量不存在，返回 null
  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey };
}

/**
 * 异步获取 Supabase 凭据（支持运行时配置）
 * 仅在服务器端可用
 */
async function getSupabaseCredentialsAsync(): Promise<SupabaseCredentials | null> {
  if (cachedCredentials) {
    return cachedCredentials;
  }

  // 1. 先尝试从环境变量获取
  const envCredentials = getSupabaseCredentialsFromEnv();
  if (envCredentials) {
    cachedCredentials = envCredentials;
    return envCredentials;
  }

  // 2. 如果环境变量不存在，尝试从运行时配置文件读取（仅服务器端）
  if (!checkedRuntimeConfig) {
    checkedRuntimeConfig = true;
    try {
      // 动态导入，避免客户端打包 fs 模块
      const { getDatabaseConfig } = await import('@/lib/config/database-config');
      const config = await getDatabaseConfig();
      if (config && config.supabaseUrl && config.supabaseAnonKey) {
        cachedCredentials = {
          url: config.supabaseUrl,
          anonKey: config.supabaseAnonKey,
        };
        return cachedCredentials;
      }
    } catch (error) {
      console.error('读取运行时配置失败:', error);
    }
  }

  return null;
}

/**
 * 同步获取 Supabase 凭据（仅用于环境变量）
 * 在构建时如果环境变量不存在，返回 null 而不是抛出错误
 */
function getSupabaseCredentials(): SupabaseCredentials | null {
  if (cachedCredentials) {
    return cachedCredentials;
  }

  // 仅从环境变量获取（同步方式）
  const envCredentials = getSupabaseCredentialsFromEnv();
  if (envCredentials) {
    cachedCredentials = envCredentials;
  }

  return envCredentials;
}

/**
 * 检查 Supabase 是否已配置（同步）
 */
export function isSupabaseConfigured(): boolean {
  return getSupabaseCredentials() !== null;
}

/**
 * 异步检查 Supabase 是否已配置（支持运行时配置）
 */
export async function isSupabaseConfiguredAsync(): Promise<boolean> {
  const credentials = await getSupabaseCredentialsAsync();
  return credentials !== null;
}

/**
 * 获取 Supabase 客户端（同步，仅支持环境变量）
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
 * 异步获取 Supabase 客户端（支持运行时配置）
 * @param token - 可选的用户认证 token，用于需要用户权限的操作
 * @returns Supabase 客户端实例
 * @throws 如果配置未找到则抛出错误
 */
export async function getSupabaseClientAsync(token?: string): Promise<SupabaseClient> {
  const credentials = await getSupabaseCredentialsAsync();

  if (!credentials) {
    throw new Error(
      'Supabase is not configured. Please configure it via /settings or set environment variables.'
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

/**
 * 异步尝试获取 Supabase 客户端，不抛出错误
 * 用于运行时动态获取配置
 */
export async function tryGetSupabaseClientAsync(): Promise<SupabaseClient | null> {
  try {
    return await getSupabaseClientAsync();
  } catch {
    return null;
  }
}

export { getSupabaseCredentials, getSupabaseClient, tryGetSupabaseClient };
