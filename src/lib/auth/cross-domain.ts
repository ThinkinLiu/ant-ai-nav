// 跨域名认证工具函数

/**
 * 获取主域名（用于子域名共享）
 * 例如：www.example.com -> example.com
 */
export function getMainDomain(hostname: string): string {
  const parts = hostname.split('.')
  
  // 如果是 localhost，返回 localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return hostname
  }
  
  // 如果是 IP 地址，返回原值
  if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return hostname
  }
  
  // 如果是域名，返回主域名（最后两部分）
  if (parts.length >= 2) {
    return `.${parts.slice(-2).join('.')}`
  }
  
  return hostname
}

/**
 * 设置跨域 Cookie（子域名共享）
 */
export function setCrossDomainCookie(
  name: string,
  value: string,
  options: {
    domain?: string
    path?: string
    secure?: boolean
    sameSite?: 'strict' | 'lax' | 'none'
    maxAge?: number
  } = {}
): void {
  const domain = options.domain || getMainDomain(window.location.hostname)
  
  const cookieOptions = [
    `${name}=${encodeURIComponent(value)}`,
    `Domain=${domain}`,
    `Path=${options.path || '/'}`,
    options.secure !== false ? 'Secure' : '',
    `SameSite=${options.sameSite || 'Lax'}`,
    options.maxAge ? `Max-Age=${options.maxAge}` : '',
  ]
    .filter(Boolean)
    .join('; ')
  
  document.cookie = cookieOptions
}

/**
 * 删除跨域 Cookie
 */
export function removeCrossDomainCookie(
  name: string,
  options: {
    domain?: string
    path?: string
  } = {}
): void {
  const domain = options.domain || getMainDomain(window.location.hostname)
  
  document.cookie = `${name}=; Domain=${domain}; Path=${options.path || '/'}; Max-Age=0`
}

/**
 * 获取共享域名列表
 */
export function getSharedDomains(): string[] {
  const sharedDomains = process.env.NEXT_PUBLIC_SHARED_DOMAINS || ''
  return sharedDomains.split(',').map(d => d.trim()).filter(Boolean)
}

/**
 * 获取主域名配置
 */
export function getMainDomainConfig(): string {
  return process.env.NEXT_PUBLIC_MAIN_DOMAIN || ''
}

/**
 * 检查是否启用了跨域认证
 */
export function isCrossDomainEnabled(): boolean {
  return !!getMainDomainConfig() || getSharedDomains().length > 0
}

/**
 * 同步认证 token 到其他域名
 * 使用 postMessage 进行跨域通信
 */
export function syncAuthTokenToDomains(
  token: string,
  action: 'login' | 'logout'
): Promise<void> {
  return new Promise((resolve) => {
    const domains = getSharedDomains()
    const timeout = parseInt(process.env.NEXT_PUBLIC_AUTH_SYNC_TIMEOUT || '5000', 10)
    
    if (domains.length === 0) {
      resolve()
      return
    }
    
    // 过滤掉当前域名
    const currentDomain = window.location.hostname
    const targetDomains = domains.filter(d => {
      const domainHostname = d.replace(/^https?:\/\//, '').replace(/:\d+$/, '')
      return domainHostname !== currentDomain
    })
    
    if (targetDomains.length === 0) {
      resolve()
      return
    }
    
    let completed = 0
    
    const handleMessage = (event: MessageEvent) => {
      // 验证消息来源
      if (!targetDomains.some(d => {
        const domainHostname = d.replace(/^https?:\/\//, '').replace(/:\d+$/, '')
        return event.origin.includes(domainHostname)
      })) {
        return
      }
      
      // 确认收到消息
      if (event.data.type === 'AUTH_SYNC_ACK') {
        completed++
        if (completed >= targetDomains.length) {
          cleanup()
          resolve()
        }
      }
    }
    
    const timeoutId = setTimeout(() => {
      console.warn('跨域认证同步超时')
      cleanup()
      resolve()
    }, timeout)
    
    const cleanup = () => {
      clearTimeout(timeoutId)
      window.removeEventListener('message', handleMessage)
    }
    
    // 监听响应
    window.addEventListener('message', handleMessage)
    
    // 发送消息到所有目标域名
    targetDomains.forEach(domain => {
      const protocol = window.location.protocol
      const port = window.location.port
      const fullDomain = `${protocol}//${domain}${port ? `:${port}` : ''}`
      
      try {
        const iframe = document.createElement('iframe')
        iframe.style.display = 'none'
        iframe.src = `${fullDomain}/api/auth/sync?token=${encodeURIComponent(token)}&action=${action}`
        
        iframe.onload = () => {
          setTimeout(() => {
            document.body.removeChild(iframe)
          }, 100)
        }
        
        iframe.onerror = () => {
          console.warn(`无法同步到域名: ${domain}`)
          document.body.removeChild(iframe)
        }
        
        document.body.appendChild(iframe)
      } catch (error) {
        console.warn(`同步到域名 ${domain} 失败:`, error)
      }
    })
  })
}
