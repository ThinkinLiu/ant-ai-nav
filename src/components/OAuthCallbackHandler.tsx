'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

/**
 * OAuth 回调处理器
 * 处理第三方登录（QQ、微信）回调时携带的 token 参数
 */
export function OAuthCallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { refreshUser } = useAuth()

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const token = searchParams.get('token')
      const userId = searchParams.get('userId')
      const oauth = searchParams.get('oauth') // qq 或 wechat
      const error = searchParams.get('error')

      // 处理错误
      if (error) {
        console.error('[OAuth回调] 错误:', error)
        toast.error(`登录失败: ${error}`)
        router.replace('/login')
        return
      }

      // 处理登录成功
      if (token && userId) {
        console.log('[OAuth回调] 收到OAuth登录回调:', { oauth, userId })

        // 保存 token 到 localStorage
        localStorage.setItem('auth_token', token)

        // 初始化活动时间
        const now = Date.now()
        localStorage.setItem('last_activity_time', now.toString())

        // 尝试获取用户信息
        try {
          const response = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          })
          const data = await response.json()

          if (data.success && data.data) {
            // 保存用户信息
            localStorage.setItem('user', JSON.stringify(data.data))
            toast.success(`${oauth === 'qq' ? 'QQ' : oauth === 'wechat' ? '微信' : ''}登录成功`)
          } else {
            // 如果获取用户信息失败，使用 token 中的基本信息
            try {
              const tokenData = JSON.parse(atob(token))
              localStorage.setItem('user', JSON.stringify({
                id: tokenData.userId,
                email: tokenData.email,
                name: tokenData.name,
                role: tokenData.role,
              }))
              toast.success(`${oauth === 'qq' ? 'QQ' : oauth === 'wechat' ? '微信' : ''}登录成功`)
            } catch (e) {
              console.error('[OAuth回调] 解析token失败:', e)
            }
          }
        } catch (e) {
          console.error('[OAuth回调] 获取用户信息失败:', e)
        }

        // 刷新 AuthContext 状态
        await refreshUser()

        // 清理 URL 参数并跳转到首页
        router.replace('/')
        return
      }
    }

    handleOAuthCallback()
  }, [searchParams, router, refreshUser])

  // 返回 null，不渲染任何内容
  return null
}
