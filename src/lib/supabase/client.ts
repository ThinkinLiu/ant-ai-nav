import { createBrowserClient } from '@supabase/ssr';

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

/**
 * 获取 Supabase 客户端
 * 支持多种环境变量命名方式，兼容 Coze 环境和独立服务器环境
 */
export function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  // 在浏览器环境中，直接从 window 中获取环境变量
  // 这些变量通过 next.config.js 中的 env 配置注入
  const supabaseUrl = 
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_COZE_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL_STANDALONE ||
    (typeof window !== 'undefined' && (window as any).__SUPABASE_URL__) ||
    '';

  const supabaseAnonKey = 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_COZE_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_STANDALONE ||
    (typeof window !== 'undefined' && (window as any).__SUPABASE_ANON_KEY__) ||
    '';

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase 配置缺失！');
    console.error('请检查以下环境变量是否已配置:');
    console.error('  - NEXT_PUBLIC_SUPABASE_URL');
    console.error('  - NEXT_PUBLIC_SUPABASE_ANON_KEY');
    console.error('');
    console.error('或者在 Coze 环境中使用:');
    console.error('  - COZE_SUPABASE_URL');
    console.error('  - COZE_SUPABASE_ANON_KEY');
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

// 兼容旧的导出方式
export const supabase = typeof window !== 'undefined' ? getSupabaseClient() : null;

export default getSupabaseClient;
