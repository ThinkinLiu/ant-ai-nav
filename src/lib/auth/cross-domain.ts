// 跨域名认证工具函数

// 配置缓存
let configCache: {
  enabled: boolean
  mainDomain: string | null
  sharedDomains: string[]
  authSyncTimeout: number
  timestamp: number
} | null = null

const CACHE_TTL = 5 * 60 * 1000 // 5分钟缓存

/**
 * 从 API 获取跨域配置
 */
async function fetchCrossDomainConfig(): Promise<{
  enabled: boolean
  mainDomain: string | null
  sharedDomains: string[]
  authSyncTimeout: number
}> {
  // 检查缓存
  if (configCache && Date.now() - configCache.timestamp < CACHE_TTL) {
    return {
      enabled: configCache.enabled,
      mainDomain: configCache.mainDomain,
      sharedDomains: configCache.sharedDomains,
      authSyncTimeout: configCache.authSyncTimeout,
    }
  }

  try {
    const response = await fetch('/api/admin/cross-domain-config', {
      cache: 'no-store',
    })
    const result = await response.json()

    if (result.success && result.data) {
      // 更新缓存
      configCache = {
        enabled: result.data.enabled,
        mainDomain: result.data.mainDomain,
        sharedDomains: result.data.sharedDomains || [],
        authSyncTimeout: result.data.authSyncTimeout || 5000,
        timestamp: Date.now(),
      }

      return {
        enabled: configCache.enabled,
        mainDomain: configCache.mainDomain,
        sharedDomains: configCache.sharedDomains,
        authSyncTimeout: configCache.authSyncTimeout,
      }
    }
  } catch (error) {
    console.error('获取跨域配置失败:', error)
  }

  // 返回默认配置
  return {
    enabled: false,
    mainDomain: null,
    sharedDomains: [],
    authSyncTimeout: 5000,
  }
}

/**
 * 清除配置缓存
 */
export function clearCrossDomainConfigCache(): void {
  configCache = null
}

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
export async function setCrossDomainCookie(
  name: string,
  value: string,
  options: {
    domain?: string
    path?: string
    secure?: boolean
    sameSite?: 'strict' | 'lax' | 'none'
    maxAge?: number
  } = {}
): Promise<void> {
  // 获取配置的主域名
  const mainDomain = await getMainDomainConfig()
  const domain = options.domain || mainDomain || getMainDomain(window.location.hostname)

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
 * 设置跨域 Cookie（同步版本，从缓存读取）
 */
export function setCrossDomainCookieSync(
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
  // 优先使用环境变量（向后兼容）
  const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN
  const domain = options.domain || mainDomain || getMainDomain(window.location.hostname)

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
export async function removeCrossDomainCookie(
  name: string,
  options: {
    domain?: string
    path?: string
  } = {}
): Promise<void> {
  const mainDomain = await getMainDomainConfig()
  const domain = options.domain || mainDomain || getMainDomain(window.location.hostname)

  document.cookie = `${name}=; Domain=${domain}; Path=${options.path || '/'}; Max-Age=0`
}

/**
 * 删除跨域 Cookie（同步版本）
 */
export function removeCrossDomainCookieSync(
  name: string,
  options: {
    domain?: string
    path?: string
  } = {}
): void {
  const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN
  const domain = options.domain || mainDomain || getMainDomain(window.location.hostname)

  document.cookie = `${name}=; Domain=${domain}; Path=${options.path || '/'}; Max-Age=0`
}

/**
 * 获取共享域名列表（异步，从配置读取）
 */
export async function getSharedDomains(): Promise<string[]> {
  const config = await fetchCrossDomainConfig()
  return config.sharedDomains
}

/**
 * 获取共享域名列表（同步，从缓存读取）
 */
export function getSharedDomainsSync(): string[] {
  // 优先使用环境变量（向后兼容）
  if (process.env.NEXT_PUBLIC_SHARED_DOMAINS) {
    return process.env.NEXT_PUBLIC_SHARED_DOMAINS
      .split(',')
      .map(d => d.trim())
      .filter(Boolean)
  }
  // 否则返回缓存的配置
  return configCache?.sharedDomains || []
}

/**
 * 获取主域名配置（异步，从配置读取）
 */
export async function getMainDomainConfig(): Promise<string | null> {
  const config = await fetchCrossDomainConfig()
  return config.mainDomain
}

/**
 * 获取主域名配置（同步，从缓存或环境变量读取）
 */
export function getMainDomainConfigSync(): string {
  // 优先使用环境变量（向后兼容）
  if (process.env.NEXT_PUBLIC_MAIN_DOMAIN) {
    return process.env.NEXT_PUBLIC_MAIN_DOMAIN
  }
  // 否则返回缓存的配置
  return configCache?.mainDomain || ''
}

/**
 * 检查是否启用了跨域认证（异步）
 */
export async function isCrossDomainEnabled(): Promise<boolean> {
  const config = await fetchCrossDomainConfig()
  return config.enabled && (!!config.mainDomain || config.sharedDomains.length > 0)
}

/**
 * 检查是否启用了跨域认证（同步，从缓存读取）
 */
export function isCrossDomainEnabledSync(): boolean {
  // 优先使用环境变量（向后兼容）
  if (process.env.NEXT_PUBLIC_MAIN_DOMAIN || process.env.NEXT_PUBLIC_SHARED_DOMAINS) {
    return true
  }
  // 否则返回缓存的配置
  return configCache?.enabled || false
}

/**
 * 同步认证 token 到其他域名
 * 使用 postMessage 进行跨域通信
 */
export async function syncAuthTokenToDomains(
  token: string,
  action: 'login' | 'logout'
): Promise<void> {
  // 获取配置
  const config = await fetchCrossDomainConfig()
  const domains = config.sharedDomains
  const timeout = config.authSyncTimeout

  // 优先使用环境变量（向后兼容）
  const envDomains = process.env.NEXT_PUBLIC_SHARED_DOMAINS
  const envTimeout = process.env.NEXT_PUBLIC_AUTH_SYNC_TIMEOUT

  const useDomains = envDomains
    ? envDomains.split(',').map(d => d.trim()).filter(Boolean)
    : domains
  const useTimeout = envTimeout ? parseInt(envTimeout, 10) : timeout

  return new Promise((resolve) => {
    if (useDomains.length === 0) {
      resolve()
      return
    }

    // 过滤掉当前域名
    const currentDomain = window.location.hostname
    const targetDomains = useDomains.filter(d => {
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
    }, useTimeout)

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
