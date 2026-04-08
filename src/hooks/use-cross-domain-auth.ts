'use client'

import { useEffect, useCallback, useRef } from 'react'
import {
  setCrossDomainCookie,
  removeCrossDomainCookie,
  syncAuthTokenToDomains,
  isCrossDomainEnabled,
} from '@/lib/auth/cross-domain'

interface CrossDomainAuthOptions {
  onLogin?: (token: string) => void
  onLogout?: () => void
}

/**
 * 跨域名认证 Hook
 * 用于在多个域名间同步登录状态
 */
export function useCrossDomainAuth(options: CrossDomainAuthOptions = {}) {
  const initializedRef = useRef(false)

  /**
   * 初始化跨域认证
   */
  const initCrossDomainAuth = useCallback(() => {
    if (initializedRef.current) return
    if (!isCrossDomainEnabled()) return
    
    initializedRef.current = true
    
    // 监听来自其他域名的认证同步消息
    const handleMessage = (event: MessageEvent) => {
      // 验证消息来源（可以添加更多验证逻辑）
      try {
        if (event.data.type === 'AUTH_SYNC_TOKEN') {
          const { token, action } = event.data
          
          if (action === 'login' && token) {
            // 保存 token
            localStorage.setItem('auth_token', token)
            
            // 同时保存到 Cookie（用于子域名共享）
            setCrossDomainCookie('auth_token', token, {
              maxAge: 30 * 24 * 60 * 60, // 30天
            })
            
            // 通知来源域收到消息
            event.source?.postMessage(
              { type: 'AUTH_SYNC_ACK' },
              event.origin
            )
            
            // 触发登录回调
            options.onLogin?.(token)
            
            // 刷新页面以加载用户信息
            setTimeout(() => {
              window.location.reload()
            }, 500)
          } else if (action === 'logout') {
            // 清除认证信息
            localStorage.removeItem('auth_token')
            removeCrossDomainCookie('auth_token')
            
            // 通知来源域收到消息
            event.source?.postMessage(
              { type: 'AUTH_SYNC_ACK' },
              event.origin
            )
            
            // 触发登出回调
            options.onLogout?.()
            
            // 刷新页面
            setTimeout(() => {
              window.location.reload()
            }, 500)
          }
        }
      } catch (error) {
        console.error('处理跨域认证消息失败:', error)
      }
    }
    
    window.addEventListener('message', handleMessage)
    
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [options])

  /**
   * 在登录后同步到其他域名
   */
  const syncLogin = useCallback(async (token: string) => {
    if (!isCrossDomainEnabled()) return
    
    // 保存到 Cookie（用于子域名共享）
    setCrossDomainCookie('auth_token', token, {
      maxAge: 30 * 24 * 60 * 60, // 30天
    })
    
    // 同步到其他完全不同的域名
    try {
      await syncAuthTokenToDomains(token, 'login')
      console.log('跨域登录同步完成')
    } catch (error) {
      console.warn('跨域登录同步失败:', error)
    }
  }, [])

  /**
   * 在登出后同步到其他域名
   */
  const syncLogout = useCallback(async () => {
    if (!isCrossDomainEnabled()) return
    
    // 清除 Cookie
    removeCrossDomainCookie('auth_token')
    
    // 同步到其他完全不同的域名
    try {
      await syncAuthTokenToDomains('', 'logout')
      console.log('跨域登出同步完成')
    } catch (error) {
      console.warn('跨域登出同步失败:', error)
    }
  }, [])

  /**
   * 自动初始化（在组件挂载时）
   */
  useEffect(() => {
    const cleanup = initCrossDomainAuth()
    return cleanup
  }, [initCrossDomainAuth])

  return {
    initCrossDomainAuth,
    syncLogin,
    syncLogout,
    isCrossDomainEnabled: isCrossDomainEnabled(),
  }
}
