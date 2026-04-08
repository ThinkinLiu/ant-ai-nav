'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { toast } from 'sonner'
import { useCrossDomainAuth } from '@/hooks/use-cross-domain-auth'

// 会话超时时间：30分钟（毫秒）
const SESSION_TIMEOUT = 30 * 60 * 1000
// 检查间隔：1分钟
const CHECK_INTERVAL = 60 * 1000
// 本地存储键名
const LAST_ACTIVITY_KEY = 'last_activity_time'

interface User {
  id: string
  email: string
  name: string | null
  avatar: string | null
  role: 'user' | 'publisher' | 'admin'
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  refreshUser: () => Promise<void>
  updateActivity: () => void
  lastActivityTime: number | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastActivityTime, setLastActivityTime] = useState<number | null>(null)

  // 跨域认证
  const { syncLogin: crossDomainSyncLogin, syncLogout: crossDomainSyncLogout } = useCrossDomainAuth({
    onLogin: (authToken) => {
      // 从其他域名收到登录消息，刷新用户信息
      fetchUser(authToken)
    },
    onLogout: () => {
      // 从其他域名收到登出消息
      setUser(null)
      setToken(null)
      setLastActivityTime(null)
      setIsLoading(false)
    },
  })

  // 更新用户活动时间
  const updateActivity = useCallback(() => {
    if (user && token) {
      const now = Date.now()
      setLastActivityTime(now)
      localStorage.setItem(LAST_ACTIVITY_KEY, now.toString())
    }
  }, [user, token])

  // 执行登出
  const performLogout = useCallback(async (authToken: string | null, reason?: string) => {
    try {
      if (authToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${authToken}` },
        })
      }
    } catch {
      // ignore
    } finally {
      setUser(null)
      setToken(null)
      setLastActivityTime(null)
      localStorage.removeItem('auth_token')
      localStorage.removeItem(LAST_ACTIVITY_KEY)
      
      if (reason) {
        console.log('已自动登出:', reason)
      }
    }
  }, [])

  const logout = useCallback(async () => {
    // 先同步到其他域名
    await crossDomainSyncLogout()
    // 然后执行登出
    await performLogout(token)
  }, [token, performLogout, crossDomainSyncLogout])

  // 从 localStorage 恢复登录状态
  const fetchUser = useCallback(async (authToken: string) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      const data = await response.json()
      if (data.success && data.data) {
        setUser(data.data)
        // 恢复或初始化活动时间
        const storedActivity = localStorage.getItem(LAST_ACTIVITY_KEY)
        if (storedActivity) {
          const activityTime = parseInt(storedActivity, 10)
          // 检查是否已超时
          if (Date.now() - activityTime > SESSION_TIMEOUT) {
            // 已超时，执行登出
            await performLogout(authToken, '会话已过期')
            // 显示提示（延迟显示，确保页面加载完成）
            setTimeout(() => {
              toast.error('登录已过期', {
                description: '长时间未操作，请重新登录',
                duration: 5000,
              })
            }, 100)
            return
          }
          setLastActivityTime(activityTime)
        } else {
          // 没有记录，初始化为当前时间
          const now = Date.now()
          setLastActivityTime(now)
          localStorage.setItem(LAST_ACTIVITY_KEY, now.toString())
        }
      } else {
        localStorage.removeItem('auth_token')
        localStorage.removeItem(LAST_ACTIVITY_KEY)
        setToken(null)
      }
    } catch {
      localStorage.removeItem('auth_token')
      localStorage.removeItem(LAST_ACTIVITY_KEY)
      setToken(null)
    } finally {
      setIsLoading(false)
    }
  }, [performLogout])

  // 初始化：恢复登录状态
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token')
    if (storedToken) {
      setToken(storedToken)
      fetchUser(storedToken)
    } else {
      setIsLoading(false)
    }
  }, [fetchUser])

  // 会话超时检查定时器
  useEffect(() => {
    if (!user || !token) return

    const checkSessionTimeout = () => {
      const storedActivity = localStorage.getItem(LAST_ACTIVITY_KEY)
      if (!storedActivity) {
        // 没有活动记录，更新为当前时间
        updateActivity()
        return
      }

      const lastActivity = parseInt(storedActivity, 10)
      const now = Date.now()

      if (now - lastActivity > SESSION_TIMEOUT) {
        // 会话已超时，执行登出
        performLogout(token, '长时间未操作，会话已过期')
        
        // 显示提示
        toast.error('登录已过期', {
          description: '长时间未操作，请重新登录',
          duration: 5000,
        })
        
        // 重定向到登录页面
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname
          if (currentPath !== '/login' && currentPath !== '/register') {
            window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}&expired=true`
          }
        }
      }
    }

    // 每分钟检查一次
    const intervalId = setInterval(checkSessionTimeout, CHECK_INTERVAL)

    return () => clearInterval(intervalId)
  }, [user, token, updateActivity, performLogout])

  // 监听用户活动事件（点击、滚动、键盘等）
  useEffect(() => {
    if (!user || !token) return

    const handleUserActivity = () => {
      updateActivity()
    }

    // 使用节流来避免频繁更新
    let throttleTimer: NodeJS.Timeout | null = null
    const throttledHandleActivity = () => {
      if (throttleTimer) return
      throttleTimer = setTimeout(() => {
        handleUserActivity()
        throttleTimer = null
      }, 10000) // 最多每10秒更新一次
    }

    // 监听用户活动事件
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart']
    events.forEach(event => {
      document.addEventListener(event, throttledHandleActivity, { passive: true })
    })

    // 监听页面可见性变化
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleUserActivity()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, throttledHandleActivity)
      })
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (throttleTimer) clearTimeout(throttleTimer)
    }
  }, [user, token, updateActivity])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()

      if (data.success && data.data) {
        const accessToken = data.data.session.access_token
        setUser(data.data.user)
        setToken(accessToken)
        localStorage.setItem('auth_token', accessToken)

        // 初始化活动时间
        const now = Date.now()
        setLastActivityTime(now)
        localStorage.setItem(LAST_ACTIVITY_KEY, now.toString())

        // 同步到其他域名
        await crossDomainSyncLogin(accessToken)

        return { success: true }
      }

      return { success: false, error: data.error || '登录失败' }
    } catch {
      return { success: false, error: '网络错误' }
    }
  }

  const register = async (email: string, password: string, name?: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      })
      const data = await response.json()
      
      if (data.success && data.data) {
        setUser(data.data.user)
        setToken(data.data.session?.access_token || null)
        if (data.data.session?.access_token) {
          localStorage.setItem('auth_token', data.data.session.access_token)
          
          // 初始化活动时间
          const now = Date.now()
          setLastActivityTime(now)
          localStorage.setItem(LAST_ACTIVITY_KEY, now.toString())
        }
        return { success: true }
      }
      
      return { success: false, error: data.error || '注册失败' }
    } catch {
      return { success: false, error: '网络错误' }
    }
  }

  const refreshUser = useCallback(async () => {
    if (token) {
      try {
        const response = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await response.json()
        if (data.success && data.data) {
          setUser(data.data)
          updateActivity()
        }
      } catch {
        // ignore
      }
    }
  }, [token, updateActivity])

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      isLoading, 
      login, 
      register, 
      logout, 
      refreshUser,
      updateActivity,
      lastActivityTime
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
