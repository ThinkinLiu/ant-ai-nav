/**
 * 客户端 Supabase 配置
 * 仅从环境变量读取，不使用文件系统
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface SupabaseCredentials {
  url: string;
  anonKey: string;
}

let cachedCredentials: SupabaseCredentials | null = null;

/**
 * 获取 Supabase 凭据（仅环境变量）
 */
function getSupabaseCredentialsFromEnv(): SupabaseCredentials | null {
  if (cachedCredentials) {
    return cachedCredentials;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.COZE_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.COZE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  cachedCredentials = { url, anonKey };
  return cachedCredentials;
}

/**
 * 检查 Supabase 是否已配置（客户端）
 */
export function isSupabaseConfiguredClient(): boolean {
  return getSupabaseCredentialsFromEnv() !== null;
}

/**
 * 获取 Supabase 客户端（客户端）
 */
export function getSupabaseClientClient(): SupabaseClient {
  const credentials = getSupabaseCredentialsFromEnv();

  if (!credentials) {
    throw new Error(
      'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.'
    );
  }

  const { url, anonKey } = credentials;

  return createClient(url, anonKey, {
    db: {
      timeout: 60000,
    },
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  });
}
