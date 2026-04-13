import { NextResponse } from 'next/server'

/**
 * 诊断接口 - 检查环境变量配置状态
 */
export async function GET() {
  const envStatus = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '已设置' : '未设置',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '已设置' : '未设置',
    COZE_SUPABASE_URL: process.env.COZE_SUPABASE_URL ? '已设置' : '未设置',
    COZE_SUPABASE_ANON_KEY: process.env.COZE_SUPABASE_ANON_KEY ? '已设置' : '未设置',
    SUPABASE_URL: process.env.SUPABASE_URL ? '已设置' : '未设置',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? '已设置' : '未设置',
    NODE_ENV: process.env.NODE_ENV,
    COZE_WORKSPACE_PATH: process.env.COZE_WORKSPACE_PATH ? '已设置' : '未设置',
  }

  // 检查是否为有效 URL
  const checkUrl = (url: string | undefined) => {
    if (!url) return '空'
    if (url.includes('placeholder') || url.includes('your-project')) return '占位符'
    return '有效值: ' + url.substring(0, 50) + '...'
  }

  const urlStatus = {
    NEXT_PUBLIC_SUPABASE_URL: checkUrl(process.env.NEXT_PUBLIC_SUPABASE_URL),
    COZE_SUPABASE_URL: checkUrl(process.env.COZE_SUPABASE_URL),
    SUPABASE_URL: checkUrl(process.env.SUPABASE_URL),
  }

  return NextResponse.json({
    success: true,
    data: {
      envStatus,
      urlStatus,
      timestamp: new Date().toISOString(),
    },
  })
}
