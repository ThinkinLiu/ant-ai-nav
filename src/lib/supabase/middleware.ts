import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getEnv } from '../env-config';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // 获取 Supabase 配置，支持多种环境变量命名方式
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
    console.error('❌ Middleware: Supabase 配置缺失！');
    console.error('请配置环境变量: NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY');
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
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

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect routes that require authentication
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    request.nextUrl.pathname !== '/' &&
    !request.nextUrl.pathname.startsWith('/api/')
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const supabaseResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    supabaseResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the object reference, like so:
  //    supabaseResponse = supabaseResponse
  // IMPORTANT: If you copy over the cookies, you must not modify them afterwards.
  // You must pass the supabaseResponse object as the first argument to the
  // middleware function.

  return supabaseResponse;
}
