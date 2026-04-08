import { NextRequest, NextResponse } from 'next/server'

/**
 * 跨域认证同步 API
 * 用于在不同域名间同步登录状态
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')
    const action = searchParams.get('action')
    
    if (!action || (action === 'login' && !token)) {
      return NextResponse.json(
        { success: false, error: '无效的请求参数' },
        { status: 400 }
      )
    }
    
    // 返回简单的 HTML 页面，使用 postMessage 与父窗口通信
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Auth Sync</title>
        </head>
        <body>
          <script>
            try {
              // 获取父窗口（可能跨域）
              if (window.opener) {
                // 使用 opener（适用于弹窗方式）
                window.opener.postMessage({
                  type: 'AUTH_SYNC_TOKEN',
                  token: '${token || ''}',
                  action: '${action}'
                }, '*');
              } else if (window.parent !== window) {
                // 使用 parent（适用于 iframe 方式）
                window.parent.postMessage({
                  type: 'AUTH_SYNC_TOKEN',
                  token: '${token || ''}',
                  action: '${action}'
                }, '*');
              }
              
              // 监听确认消息
              window.addEventListener('message', function(event) {
                if (event.data.type === 'AUTH_SYNC_ACK') {
                  // 收到确认，可以关闭页面
                  console.log('认证同步确认收到');
                  if (window.opener) {
                    window.close();
                  }
                }
              }, { once: true });
              
              // 3秒后自动关闭
              setTimeout(function() {
                if (window.opener) {
                  window.close();
                }
              }, 3000);
            } catch (error) {
              console.error('认证同步失败:', error);
            }
          </script>
        </body>
      </html>
    `
    
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        // 允许跨域
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    console.error('跨域认证同步错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
