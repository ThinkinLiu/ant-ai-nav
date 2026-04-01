import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { validateEnv } from '../env-config';

let supabaseServerClient: ReturnType<typeof createServerClient> | null = null;

/**
 * 获取 Supabase 服务端客户端
 * 支持多种环境变量命名方式，兼容 Coze 环境和独立服务器环境
 */
export async function getSupabaseServerClient() {
  if (supabaseServerClient) {
    return supabaseServerClient;
  }

  // 验证环境变量
  const envResult = validateEnv();
  
  if (!envResult.isValid || !envResult.config) {
    console.error('❌ Supabase 服务端配置缺失！');
    console.error('缺少的环境变量:', envResult.missing.join(', '));
    console.error('当前环境:', envResult.environment);
    console.error('');
    console.error('请参考以下文档配置环境变量:');
    console.error('  - docs/deployment-guide.md');
    console.error('  - .env.example');
    
    throw new Error(
      `Supabase 配置缺失。缺少: ${envResult.missing.join(', ')}。` +
      `请查看文档: docs/deployment-guide.md`
    );
  }

  const cookieStore = await cookies();

  supabaseServerClient = createServerClient(
    envResult.config.supabaseUrl,
    envResult.config.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );

  return supabaseServerClient;
}

/**
 * 重置 Supabase 服务端客户端（用于测试或重新初始化）
 */
export function resetSupabaseServerClient() {
  supabaseServerClient = null;
}

/**
 * 创建新的 Supabase 服务端客户端实例
 * 每次调用都创建新实例，适用于需要独立会话的场景
 */
export async function createSupabaseServerClient() {
  const envResult = validateEnv();
  
  if (!envResult.isValid || !envResult.config) {
    throw new Error(
      `Supabase 配置缺失。缺少: ${envResult.missing.join(', ')}。` +
      `请查看文档: docs/deployment-guide.md`
    );
  }

  const cookieStore = await cookies();

  return createServerClient(
    envResult.config.supabaseUrl,
    envResult.config.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

export default getSupabaseServerClient;
