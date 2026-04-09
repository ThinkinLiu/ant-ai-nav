import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getEnv } from '../env-config';

/**
 * 验证用户是否已登录
 * 支持多种认证方式：
 * 1. Supabase Auth 的 sb-access-token cookie
 * 2. 自定义的 auth_token cookie
 */
async function verifyUser(request: NextRequest): Promise<boolean> {
  // 获取 Supabase 配置
  const supabaseUrl = getEnv([
    'NEXT_PUBLIC_SUPABASE_URL',
    'COZE_SUPABASE_URL',
    'SUPABASE_URL',
  ]);
  
  const supabaseAnonKey = getEnv([
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'COZE_SUPABASE_ANON_KEY',
    'SUPABASE_ANON_KEY',
  ]);

  if (!supabaseUrl || !supabaseAnonKey) {
    return false;
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  // 创建 Supabase Server Client
  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 方式1: 使用 Supabase Auth 验证
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (user && !authError) {
    console.log('[Middleware] Supabase Auth 验证成功:', user.email);
    return true;
  }

  // 方式2: 使用自定义 auth_token cookie 验证
  const authToken = request.cookies.get('auth_token')?.value;
  if (authToken) {
    console.log('[Middleware] 使用自定义 auth_token 验证');
    
    try {
      // 验证 token 格式（Base64 编码的 JSON）
      const tokenData = JSON.parse(Buffer.from(authToken, 'base64').toString());
      
      // 检查 token 是否过期
      if (tokenData.exp && tokenData.exp < Date.now()) {
        console.log('[Middleware] 自定义 token 已过期');
        return false;
      }
      
      // 如果有 userId，使用 Supabase 的 getUserById 或其他方式验证
      if (tokenData.userId) {
        // 检查用户是否存在于数据库
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('id', tokenData.userId)
          .single();
        
        if (userData) {
          console.log('[Middleware] 自定义 token 验证成功, userId:', tokenData.userId);
          return true;
        }
      }
    } catch (e) {
      console.log('[Middleware] 自定义 token 解析失败');
    }
  }

  return false;
}

export async function updateSession(request: NextRequest) {
  // 公开路径不需要验证
  const publicPaths = [
    '/login',
    '/register',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/sync',
    '/api/oauth/',
    '/api/sms/',
    '/api/site-settings',
    '/api/categories',
    '/api/tools',
    '/api/news',
    '/api/home',
    '/api/announcements',
    '/api/hall-of-fame',
    '/api/timeline',
    '/api/search',
    '/favicon.ico',
    '/logo.png',
    '/og-image.png',
  ];

  const pathname = request.nextUrl.pathname;
  
  // 检查是否是公开路径
  const isPublicPath = publicPaths.some(path => 
    pathname === path || pathname.startsWith(path)
  );

  // 首页总是允许访问
  if (pathname === '/') {
    return NextResponse.next();
  }

  // 公开路径不需要验证
  if (isPublicPath) {
    return NextResponse.next();
  }

  // 验证用户
  const isAuthenticated = await verifyUser(request);

  if (!isAuthenticated) {
    console.log('[Middleware] 用户未认证，重定向到登录页:', pathname);
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
