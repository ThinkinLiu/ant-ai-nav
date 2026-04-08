import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  const pathname = request.nextUrl.pathname

  // 获取实际路径（支持 nginx 反向代理场景）
  // 如果 nginx 设置了 x-actual-path header，使用它作为实际路径
  const actualPath = request.headers.get('x-actual-path') || pathname

  // 添加 pathname 到 header（用于 Footer 等组件判断）
  response.headers.set('x-pathname', pathname)

  // 添加实际路径到 header（用于 Header 判断是否在博客页面）
  response.headers.set('x-actual-path', actualPath)

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
