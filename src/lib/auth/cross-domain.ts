// 跨域名认证工具函数

// 配置缓存
let configCache: {
  enabled: boolean
  mainDomain: string | null
  mainDomains: string[]  // 支持多个主域名
  sharedDomains: string[]
  authSyncTimeout: number
  timestamp: number
} | null = null

const CACHE_TTL = 5 * 60 * 1000 // 5分钟缓存

interface CrossDomainConfig {
  enabled: boolean
  mainDomain: string | null
  mainDomains: string[]
  sharedDomains: string[]
  authSyncTimeout: number
}

/**
 * 从 API 获取跨域配置
 */
export async function fetchCrossDomainConfig(): Promise<CrossDomainConfig> {
  // 检查缓存
  if (configCache && Date.now() - configCache.timestamp < CACHE_TTL) {
    return {
      enabled: configCache.enabled,
      mainDomain: configCache.mainDomain,
      mainDomains: configCache.mainDomains,
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
        mainDomains: result.data.mainDomains || [], // 支持多个主域名
        sharedDomains: result.data.sharedDomains || [],
        authSyncTimeout: result.data.authSyncTimeout || 5000,
        timestamp: Date.now(),
      }

      return {
        enabled: configCache.enabled,
        mainDomain: configCache.mainDomain,
        mainDomains: configCache.mainDomains,
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
    mainDomains: [],
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
 * 例如：www.example.com -> .example.com
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
  
  // 如果是域名，返回主域名（最后两部分，带点前缀）
  if (parts.length >= 2) {
    return `.${parts.slice(-2).join('.')}`
  }
  
  return hostname
}

/**
 * 检查当前域名是否在配置的主域名列表中
 * 返回匹配的主域名（如 .mayiai.site），否则返回当前解析的主域名
 */
export async function getMatchedMainDomain(hostname: string): Promise<string | null> {
  const config = await fetchCrossDomainConfig()
  
  if (!config.enabled) {
    return null
  }

  // 获取当前解析的主域名
  const currentMainDomain = getMainDomain(hostname)

  // 检查是否在配置的主域名列表中
  const allMainDomains = config.mainDomains || (config.mainDomain ? [config.mainDomain] : [])
  
  for (const domain of allMainDomains) {
    // 确保带点前缀
    const normalizedDomain = domain.startsWith('.') ? domain : `.${domain}`
    if (currentMainDomain === normalizedDomain) {
      return normalizedDomain
    }
    // 也检查不带点的前缀匹配
    const domainWithoutDot = domain.replace(/^\./, '')
    if (hostname.endsWith(domainWithoutDot) || currentMainDomain === `.${domainWithoutDot}`) {
      return normalizedDomain.startsWith('.') ? normalizedDomain : `.${normalizedDomain}`
    }
  }

  // 如果没有匹配，返回当前主域名
  return currentMainDomain !== hostname ? currentMainDomain : null
}

/**
 * 获取所有配置的主域名列表
 */
export async function getAllMainDomains(): Promise<string[]> {
  const config = await fetchCrossDomainConfig()
  const domains = config.mainDomains || (config.mainDomain ? [config.mainDomain] : [])
  // 标准化：确保都带点前缀
  return domains.map((d: string) => d.startsWith('.') ? d : `.${d}`)
}

/**
 * 获取当前域名需要设置的主域名
 * 如果当前域名匹配配置的主域名，返回该主域名；否则返回 null
 */
export function getCurrentMainDomainForCookie(): string | null {
  if (typeof window === 'undefined') return null
  
  const hostname = window.location.hostname.split(':')[0]
  
  // 优先使用环境变量
  const envMainDomains = process.env.NEXT_PUBLIC_MAIN_DOMAINS
  if (envMainDomains) {
    const domains = envMainDomains.split(',').map(d => d.trim())
    const currentMainDomain = getMainDomain(hostname)
    
    for (const domain of domains) {
      const normalizedDomain = domain.startsWith('.') ? domain : `.${domain}`
      if (currentMainDomain === normalizedDomain) {
        return normalizedDomain
      }
    }
  }
  
  // 使用单个主域名环境变量（兼容）
  const envMainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN
  if (envMainDomain) {
    const currentMainDomain = getMainDomain(hostname)
    const normalizedEnvDomain = envMainDomain.startsWith('.') ? envMainDomain : `.${envMainDomain}`
    if (currentMainDomain === normalizedEnvDomain) {
      return normalizedEnvDomain
    }
  }
  
  return null
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
 * 使用多种方式尝试跨域同步：
 * 1. window.open + postMessage 方式（最可靠，直接在目标域设置 cookie）
 * 2. 同步 cookie 到主域名（用于子域名共享）
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

  if (useDomains.length === 0) {
    console.log('[跨域同步] 没有配置共享域名')
    return
  }

  // 过滤掉当前域名
  const currentDomain = window.location.hostname
  const targetDomains = useDomains.filter(d => {
    const domainHostname = d.replace(/^https?:\/\//, '').replace(/:\d+$/, '')
    return domainHostname !== currentDomain
  })

  if (targetDomains.length === 0) {
    console.log('[跨域同步] 没有需要同步的目标域名')
    return
  }

  console.log('[跨域同步] 开始同步到:', targetDomains, 'action:', action)

  // 首先，同步到主域名（用于子域名共享）
  // 如果当前域名是子域名，设置 Cookie 到主域名
  const mainDomain = getMainDomain(currentDomain)
  if (mainDomain !== currentDomain) {
    const cookieValue = action === 'login' ? token : ''
    const maxAge = action === 'login' ? 60 * 60 * 24 * 30 : 0 // 30天或立即过期
    
    // 设置带有主域名的 Cookie
    document.cookie = `auth_token=${encodeURIComponent(cookieValue)}; Domain=${mainDomain}; Path=/; Max-Age=${maxAge}; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
    document.cookie = `auth_sync=${action === 'login' ? '1' : '0'}; Domain=${mainDomain}; Path=/; Max-Age=${maxAge}; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
    
    console.log('[跨域同步] 已同步到主域名:', mainDomain, 'action:', action)
  }

  // 创建一个 Promise 数组，用于并行同步
  const syncPromises = targetDomains.map(domain => {
    return new Promise<void>((resolve) => {
      const protocol = window.location.protocol
      const port = window.location.port
      const fullDomain = `${protocol}//${domain}${port ? `:${port}` : ''}`
      
      console.log(`[跨域同步] 正在同步到: ${fullDomain}`)
      
      // 使用 window.open + postMessage 方式
      // 打开目标域名的同步页面
      const syncWindow = window.open(
        `${fullDomain}/api/auth/sync?action=${action}&format=window`,
        `sync_${domain.replace(/\./g, '_')}`,
        'width=1,height=1,left=-1000,top=-1000,menubar=no,toolbar=no,location=no,status=no'
      )
      
      if (!syncWindow) {
        console.warn(`[跨域同步] ${domain} 无法打开窗口，尝试 iframe 方式`)
        trySyncWithIframe(fullDomain, token, action, domain).then(resolve)
        return
      }
      
      // 等待窗口加载完成，然后发送消息
      const timeoutId = setTimeout(() => {
        console.warn(`[跨域同步] ${domain} 同步超时`)
        try {
          syncWindow.close()
        } catch {
          // ignore
        }
        resolve()
      }, useTimeout)
      
      syncWindow.onload = () => {
        // 窗口加载后，发送认证信息
        try {
          syncWindow.postMessage({
            type: 'AUTH_SYNC_TOKEN',
            token: token,
            action: action,
          }, fullDomain)
          
          console.log(`[跨域同步] 已发送消息到 ${domain}`)
        } catch (e) {
          console.warn(`[跨域同步] ${domain} 发送消息失败:`, e)
        }
        
        // 延迟关闭窗口
        setTimeout(() => {
          clearTimeout(timeoutId)
          try {
            syncWindow.close()
          } catch {
            // ignore
          }
          resolve()
        }, 1000)
      }
      
      // 监听来自窗口的响应
      const messageHandler = (event: MessageEvent) => {
        // 验证消息来源
        if (event.origin !== fullDomain) return
        
        if (event.data?.type === 'AUTH_SYNC_ACK') {
          console.log(`[跨域同步] ${domain} 确认同步完成`)
          clearTimeout(timeoutId)
          window.removeEventListener('message', messageHandler)
          try {
            syncWindow.close()
          } catch {
            // ignore
          }
          resolve()
        }
      }
      
      window.addEventListener('message', messageHandler)
      
      // 监听窗口关闭事件
      syncWindow.onunload = () => {
        clearTimeout(timeoutId)
        window.removeEventListener('message', messageHandler)
        resolve()
      }
    })
  })

  // 等待所有同步完成
  await Promise.all(syncPromises)
  console.log('[跨域同步] 所有域名同步完成')
}

/**
 * 使用 iframe 方式同步（备用方案）
 */
async function trySyncWithIframe(
  fullDomain: string,
  token: string,
  action: 'login' | 'logout',
  domain: string
): Promise<void> {
  return new Promise((resolve) => {
    try {
      const iframe = document.createElement('iframe')
      iframe.style.display = 'none'
      iframe.style.visibility = 'hidden'
      iframe.src = `${fullDomain}/api/auth/sync?token=${encodeURIComponent(token)}&action=${action}`
      
      // 超时处理
      const timeoutId = setTimeout(() => {
        console.warn(`[跨域同步] ${domain} iframe 方式超时`)
        cleanup()
      }, 3000)

      const cleanup = () => {
        clearTimeout(timeoutId)
        try {
          if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe)
          }
        } catch {
          // ignore
        }
      }

      iframe.onload = () => {
        // iframe 加载完成，但无法确定是否成功
        // 由于跨域限制，无法通过 postMessage 通信
        console.log(`[跨域同步] ${domain} iframe 已加载（无法确认同步状态）`)
        cleanup()
        resolve()
      }
      
      iframe.onerror = () => {
        console.warn(`[跨域同步] ${domain} iframe 方式失败`)
        cleanup()
        resolve()
      }
      
      document.body.appendChild(iframe)
    } catch (error) {
      console.warn(`[跨域同步] ${domain} iframe 方式异常:`, error)
      resolve()
    }
  })
}
