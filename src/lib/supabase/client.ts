import { createBrowserClient } from '@supabase/ssr';

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

/**
 * 获取 Supabase 客户端
 * 统一使用 NEXT_PUBLIC_ 前缀的环境变量
 */
export function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  // 在浏览器环境中，直接从 window 中获取环境变量
  // 这些变量通过 next.config.js 中的 env 配置注入
  const supabaseUrl = 
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    (typeof window !== 'undefined' && (window as any).__SUPABASE_URL__) ||
    '';

  const supabaseAnonKey = 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    (typeof window !== 'undefined' && (window as any).__SUPABASE_ANON_KEY__) ||
    '';

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase 配置缺失！');
    console.error('请检查以下环境变量是否已配置:');
    console.error('  - NEXT_PUBLIC_SUPABASE_URL');
    console.error('  - NEXT_PUBLIC_SUPABASE_ANON_KEY');
    console.error('');
    console.error('查看文档获取帮助: docs/deployment-guide.md');
    
    // 返回一个空客户端，避免应用崩溃
    // 但会在控制台显示错误信息
    return null;
  }

  supabaseClient = createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  );

  return supabaseClient;
}

/**
 * 重置 Supabase 客户端（用于测试或重新初始化）
 */
export function resetSupabaseClient() {
  supabaseClient = null;
}
