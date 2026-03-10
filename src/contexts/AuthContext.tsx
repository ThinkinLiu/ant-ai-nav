'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 从 localStorage 恢复登录状态
    const storedToken = localStorage.getItem('auth_token')
    if (storedToken) {
      setToken(storedToken)
      fetchUser(storedToken)
    } else {
      setIsLoading(false)
    }
  }, [])

  const fetchUser = async (authToken: string) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      const data = await response.json()
      if (data.success && data.data) {
        setUser(data.data)
      } else {
        localStorage.removeItem('auth_token')
        setToken(null)
      }
    } catch {
      localStorage.removeItem('auth_token')
      setToken(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()
      
      if (data.success && data.data) {
        setUser(data.data.user)
        setToken(data.data.session.access_token)
        localStorage.setItem('auth_token', data.data.session.access_token)
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
        }
        return { success: true }
      }
      
      return { success: false, error: data.error || '注册失败' }
    } catch {
      return { success: false, error: '网络错误' }
    }
  }

  const logout = async () => {
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        })
      }
    } catch {
      // ignore
    } finally {
      setUser(null)
      setToken(null)
      localStorage.removeItem('auth_token')
    }
  }

  const refreshUser = async () => {
    if (token) {
      await fetchUser(token)
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, refreshUser }}>
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
