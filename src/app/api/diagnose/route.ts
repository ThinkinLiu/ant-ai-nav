import { NextResponse } from 'next/server'
import { isPlaceholderUrl, isPlaceholderKey } from '@/lib/env-config'

/**
 * 获取环境变量（支持 NEXT_PUBLIC_ 和 COZE_ 前缀）
 */
function getEnvVar(key: string, fallbackKey?: string): string | undefined {
  return process.env[key] || (fallbackKey ? process.env[fallbackKey] : undefined);
}

/**
 * 诊断接口 - 检查环境变量配置状态
 * 优先使用 COZE_ 前缀（Coze 平台运行时环境变量）
 * 备选 NEXT_PUBLIC_ 前缀（构建时内联）
 */
export async function GET() {
  // 优先使用 COZE_ 前缀（Coze 平台运行时环境变量）
  const supabaseUrl = process.env.COZE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.COZE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  const envStatus = {
    COZE_SUPABASE_URL: process.env.COZE_SUPABASE_URL ? '已设置 (值: ' + (process.env.COZE_SUPABASE_URL?.substring(0, 50) || 'N/A') + '...)' : '未设置',
    COZE_SUPABASE_ANON_KEY: process.env.COZE_SUPABASE_ANON_KEY ? '已设置' : '未设置',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '已设置 (值: ' + (process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 50) || 'N/A') + '...)' : '未设置',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '已设置' : '未设置',
    NODE_ENV: process.env.NODE_ENV,
    COZE_WORKSPACE_PATH: process.env.COZE_WORKSPACE_PATH ? '已设置' : '未设置',
  }

  // 检查是否为有效 URL
  const checkUrl = (url: string | undefined) => {
    if (!url) return '空'
    if (isPlaceholderUrl(url)) return '占位符'
    return '有效值: ' + url.substring(0, 50) + '...'
  }

  // 检查是否为有效 KEY
  const checkKey = (key: string | undefined) => {
    if (!key) return '空'
    if (isPlaceholderKey(key)) return '占位符'
    return '有效值: ' + key.substring(0, 20) + '...'
  }

  const urlStatus = {
    NEXT_PUBLIC_SUPABASE_URL: checkUrl(process.env.NEXT_PUBLIC_SUPABASE_URL),
    COZE_SUPABASE_URL: checkUrl(process.env.COZE_SUPABASE_URL),
    resolvedUrl: checkUrl(supabaseUrl),
  }

  const keyStatus = {
    NEXT_PUBLIC_SUPABASE_ANON_KEY: checkKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    COZE_SUPABASE_ANON_KEY: checkKey(process.env.COZE_SUPABASE_ANON_KEY),
    resolvedKey: checkKey(supabaseKey),
  }

  return NextResponse.json({
    success: true,
    data: {
      envStatus,
      urlStatus,
      keyStatus,
      timestamp: new Date().toISOString(),
    },
  })
}
