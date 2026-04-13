import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { getEnv } from '@/lib/env-config'

/**
 * 跨域认证同步 API
 * 支持两种模式：
 * 1. 页面加载模式（返回 HTML + JS，用于 iframe/直接访问）
 * 2. API 模式（直接设置 cookie，用于 fetch/img/script 跨域请求）
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')
    const action = searchParams.get('action')
    const format = searchParams.get('format') || 'html' // html, json, 或 jsonp
    
    if (!action || (action === 'login' && !token)) {
      if (format === 'json') {
        return NextResponse.json(
          { success: false, error: '无效的请求参数' },
          { status: 400 }
        )
      }
      return new NextResponse('Invalid parameters', { status: 400 })
    }

    // 获取 Supabase 配置（支持 NEXT_PUBLIC_ 和 COZE_ 前缀）
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.COZE_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.COZE_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      if (format === 'json') {
        return NextResponse.json(
          { success: false, error: '服务器配置错误' },
          { status: 500 }
        )
      }
      return new NextResponse('Server config error', { status: 500 })
    }

    // 获取主域名
    const requestHostname = request.headers.get('host')?.split(':')[0] || 'localhost'
    const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 
      (requestHostname !== 'localhost' && !/^\d+\.\d+\.\d+\.\d+$/.test(requestHostname) 
        ? `.${requestHostname.split('.').slice(-2).join('.')}` 
        : requestHostname)

    // 创建响应对象
    let response: NextResponse

    if (format === 'json') {
      // JSON 模式：直接设置 cookie 并返回结果
      const responseHeaders = new Headers()
      responseHeaders.set('Content-Type', 'application/json')
      responseHeaders.set('Access-Control-Allow-Origin', '*')
      
      if (action === 'login' && token) {
        // 获取刷新令牌（如果可用）
        const refreshToken = searchParams.get('refresh_token') || token
        
        // 设置 Supabase SSR cookie
        const cookieOptions: CookieOptions = {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 天
          path: '/',
        }
        
        // 如果是子域名，设置 domain
        if (mainDomain !== 'localhost' && mainDomain !== requestHostname) {
          cookieOptions.domain = mainDomain
        }

        // 设置 cookie
        responseHeaders.set('Set-Cookie', [
          `sb-access-token=${encodeURIComponent(token)}; Path=/; Max-Age=${60 * 60 * 24 * 7}; ${process.env.NODE_ENV === 'production' ? 'Secure; ' : ''}SameSite=Lax${cookieOptions.domain ? `; Domain=${cookieOptions.domain}` : ''}`,
          `sb-refresh-token=${encodeURIComponent(refreshToken)}; Path=/; Max-Age=${60 * 60 * 24 * 7}; ${process.env.NODE_ENV === 'production' ? 'Secure; ' : ''}SameSite=Lax${cookieOptions.domain ? `; Domain=${cookieOptions.domain}` : ''}`,
          `auth_token=${encodeURIComponent(token)}; Path=/; Max-Age=${60 * 60 * 24 * 7}; ${process.env.NODE_ENV === 'production' ? 'Secure; ' : ''}SameSite=Lax${cookieOptions.domain ? `; Domain=${cookieOptions.domain}` : ''}`,
        ].join(', '))

        response = new NextResponse(JSON.stringify({ success: true, action: 'login' }), {
          headers: responseHeaders,
        })
      } else if (action === 'logout') {
        // 清除 cookie
        responseHeaders.set('Set-Cookie', [
          `sb-access-token=; Path=/; Max-Age=0; SameSite=Lax${mainDomain !== 'localhost' && mainDomain !== requestHostname ? `; Domain=${mainDomain}` : ''}`,
          `sb-refresh-token=; Path=/; Max-Age=0; SameSite=Lax${mainDomain !== 'localhost' && mainDomain !== requestHostname ? `; Domain=${mainDomain}` : ''}`,
          `auth_token=; Path=/; Max-Age=0; SameSite=Lax${mainDomain !== 'localhost' && mainDomain !== requestHostname ? `; Domain=${mainDomain}` : ''}`,
        ].join(', '))

        response = new NextResponse(JSON.stringify({ success: true, action: 'logout' }), {
          headers: responseHeaders,
        })
      } else {
        response = NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
      }
    } else if (format === 'jsonp') {
      // JSONP 模式：通过回调函数返回
      const callback = searchParams.get('callback') || 'callback'
      
      // 准备 cookie 设置
      const cookieMaxAge = 60 * 60 * 24 * 7
      const cookieDomain = mainDomain !== 'localhost' && mainDomain !== requestHostname 
        ? `; Domain=${mainDomain}` 
        : ''
      const secureCookie = process.env.NODE_ENV === 'production' ? '; Secure' : ''
      
      const responseHeaders = new Headers()
      responseHeaders.set('Content-Type', 'application/javascript; charset=utf-8')
      
      let result: any
      let cookies: string[] = []
      
      if (action === 'login' && token) {
        const refreshToken = searchParams.get('refresh_token') || token
        
        cookies = [
          `sb-access-token=${encodeURIComponent(token)}; Path=/; Max-Age=${cookieMaxAge}${secureCookie}; SameSite=Lax${cookieDomain}`,
          `sb-refresh-token=${encodeURIComponent(refreshToken)}; Path=/; Max-Age=${cookieMaxAge}${secureCookie}; SameSite=Lax${cookieDomain}`,
          `auth_token=${encodeURIComponent(token)}; Path=/; Max-Age=${cookieMaxAge}${secureCookie}; SameSite=Lax${cookieDomain}`,
        ]
        result = { success: true, action: 'login' }
      } else if (action === 'logout') {
        cookies = [
          `sb-access-token=; Path=/; Max-Age=0; SameSite=Lax${cookieDomain}`,
          `sb-refresh-token=; Path=/; Max-Age=0; SameSite=Lax${cookieDomain}`,
          `auth_token=; Path=/; Max-Age=0; SameSite=Lax${cookieDomain}`,
        ]
        result = { success: true, action: 'logout' }
      } else {
        result = { success: false, error: 'Invalid action' }
      }
      
      // JSONP 响应：执行回调函数
      responseHeaders.set('Set-Cookie', cookies.join(', '))
      
      const jsonpResponse = `
        try {
          // 设置 cookie（在当前域）
          ${cookies.map(c => `document.cookie = '${c.replace(/; /g, '; ')}'`).join('; ')}
          
          // 调用回调函数
          if (typeof ${callback} === 'function') {
            ${callback}(${JSON.stringify(result)});
          } else if (typeof window.${callback} === 'function') {
            window.${callback}(${JSON.stringify(result)});
          }
        } catch(e) {
          console.error('JSONP callback error:', e);
        }
      `
      
      response = new NextResponse(jsonpResponse, {
        headers: responseHeaders,
      })
    } else {
      // HTML 模式：返回页面，使用 JS 设置 cookie 并通知父窗口
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Auth Sync</title>
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                display: flex; 
                align-items: center; 
                justify-content: center; 
                height: 100vh; 
                margin: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
              }
              .status {
                text-align: center;
                padding: 20px;
                background: rgba(255,255,255,0.1);
                border-radius: 10px;
                backdrop-filter: blur(10px);
              }
              .success { color: #4ade80; }
              .error { color: #f87171; }
            </style>
          </head>
          <body>
            <div class="status" id="status">
              <div class="success">同步中...</div>
            </div>
            <script>
              (function() {
                var token = '${token || ''}';
                var action = '${action}';
                var mainDomain = '${mainDomain}';
                var requestHostname = '${requestHostname}';
                
                // 设置 Cookie（支持子域名）
                function setCookie(name, value, days, domain) {
                  var expires = '';
                  if (days) {
                    var date = new Date();
                    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                    expires = '; expires=' + date.toUTCString();
                  }
                  var cookieValue = name + '=' + (value || '')  + expires + '; path=/' + 
                    (domain && domain !== requestHostname ? '; domain=' + domain : '') +
                    '; SameSite=Lax' + 
                    (location.protocol === 'https:' ? '; Secure' : '');
                  document.cookie = cookieValue;
                }
                
                // 清除 Cookie
                function clearCookie(name, domain) {
                  setCookie(name, '', -1, domain);
                }
                
                var cookieDomain = (mainDomain && mainDomain !== 'localhost' && mainDomain !== requestHostname) ? mainDomain : null;
                
                if (action === 'login' && token) {
                  // 设置认证 cookie
                  setCookie('sb-access-token', token, 7, cookieDomain);
                  setCookie('sb-refresh-token', token, 7, cookieDomain);
                  setCookie('auth_token', token, 7, cookieDomain);
                  
                  document.getElementById('status').innerHTML = '<div class="success">登录状态已同步</div>';
                  console.log('Auth sync completed: login');
                  
                  // 尝试通知父窗口
                  try {
                    if (window.parent !== window) {
                      window.parent.postMessage({ 
                        type: 'AUTH_SYNC_TOKEN', 
                        token: token, 
                        action: 'login' 
                      }, '*');
                    }
                  } catch(e) {
                    console.log('Cannot notify parent:', e);
                  }
                } else if (action === 'logout') {
                  // 清除认证 cookie
                  clearCookie('sb-access-token', cookieDomain);
                  clearCookie('sb-refresh-token', cookieDomain);
                  clearCookie('auth_token', cookieDomain);
                  
                  document.getElementById('status').innerHTML = '<div class="success">已清除登录状态</div>';
                  console.log('Auth sync completed: logout');
                  
                  // 尝试通知父窗口
                  try {
                    if (window.parent !== window) {
                      window.parent.postMessage({ 
                        type: 'AUTH_SYNC_TOKEN', 
                        token: '', 
                        action: 'logout' 
                      }, '*');
                    }
                  } catch(e) {
                    console.log('Cannot notify parent:', e);
                  }
                }
                
                // 通知来源并关闭
                window.addEventListener('message', function(event) {
                  if (event.data && event.data.type === 'AUTH_SYNC_PING') {
                    event.source.postMessage({ type: 'AUTH_SYNC_ACK' }, event.origin);
                  }
                });
                
                // 3秒后关闭
                setTimeout(function() {
                  // 如果是 iframe 方式，尝试通知父窗口
                  try {
                    if (window.parent !== window) {
                      window.parent.postMessage({ type: 'AUTH_SYNC_COMPLETE', action: action }, '*');
                    }
                  } catch(e) {}
                  
                  // 对于直接访问，提示用户
                  if (window.opener) {
                    window.close();
                  }
                }, 1500);
              })();
            </script>
          </body>
        </html>
      `
      
      response = new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      })
    }
    
    return response
  } catch (error) {
    console.error('跨域认证同步错误:', error)
    if (format === 'json') {
      return NextResponse.json(
        { success: false, error: '服务器错误' },
        { status: 500 }
      )
    }
    return new NextResponse('Server error', { status: 500 })
  }
}

// 支持 OPTIONS 请求（CORS 预检）
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
