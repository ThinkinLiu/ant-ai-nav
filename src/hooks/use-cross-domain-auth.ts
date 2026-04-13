'use client'

import { useEffect, useRef } from 'react'
import {
  setCrossDomainCookieSync,
  removeCrossDomainCookieSync,
  isCrossDomainEnabled,
  clearCrossDomainConfigCache,
} from '@/lib/auth/cross-domain'

interface CrossDomainAuthCallbacks {
  onLogin?: (token: string) => void
  onLogout?: () => void
}

/**
 * 跨域名认证 Hook（简化版）
 * 
 * 注意：这个 hook 现在主要用于接收来自其他域名的 postMessage 消息。
 * 主动同步功能已移除，因为：
 * - 子域名：通过设置 Domain=.mayiai.site 的 Cookie 自动共享
 * - 跨域名：其他域名访问时 /api/auth/me 会自动验证 Cookie 中的 token
 */
export function useCrossDomainAuth(callbacks: CrossDomainAuthCallbacks = {}) {
  const initializedRef = useRef(false)

  /**
   * 自动初始化消息监听
   */
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    const init = async () => {
      const enabled = await isCrossDomainEnabled()
      if (!enabled) return

      const handleMessage = (event: MessageEvent) => {
        try {
          if (event.data?.type === 'AUTH_SYNC_TOKEN') {
            const { token, action } = event.data

            if (action === 'login' && token) {
              // 保存 token
              localStorage.setItem('auth_token', token)

              // 同时保存到 Cookie（用于子域名共享）
              setCrossDomainCookieSync('auth_token', token, {
                maxAge: 30 * 24 * 60 * 60, // 30天
              })

              // 通知来源域收到消息
              event.source?.postMessage(
                { type: 'AUTH_SYNC_ACK' },
                { targetOrigin: event.origin }
              )

              // 触发登录回调
              callbacks.onLogin?.(token)

              // 刷新页面以加载用户信息
              setTimeout(() => {
                window.location.reload()
              }, 500)
            } else if (action === 'logout') {
              // 清除认证信息
              localStorage.removeItem('auth_token')
              removeCrossDomainCookieSync('auth_token')

              // 通知来源域收到消息
              event.source?.postMessage(
                { type: 'AUTH_SYNC_ACK' },
                { targetOrigin: event.origin }
              )

              // 触发登出回调
              callbacks.onLogout?.()

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
    }

    init()

    return () => {
      initializedRef.current = false
    }
  }, [callbacks])

  /**
   * 重新加载配置
   */
  const reloadConfig = async () => {
    clearCrossDomainConfigCache()
    await isCrossDomainEnabled()
  }

  return {
    reloadConfig,
  }
}
