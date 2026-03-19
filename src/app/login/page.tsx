'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { Separator } from '@/components/ui/separator'

// 英文错误信息翻译为中文
const translateError = (error: string): string => {
  const errorMap: Record<string, string> = {
    'Invalid login credentials': '邮箱或密码错误',
    'Email not confirmed': '邮箱未验证，请先查收验证邮件',
    'Too many requests': '登录尝试过于频繁，请稍后再试',
    'User not found': '用户不存在',
    'Invalid email': '邮箱格式不正确',
    'Invalid password': '密码格式不正确',
    'Email and password are required': '请输入邮箱和密码',
    'Failed to fetch': '网络连接失败，请检查网络',
    'Network request failed': '网络请求失败，请稍后重试',
  }
  
  // 精确匹配
  if (errorMap[error]) {
    return errorMap[error]
  }
  
  // 模糊匹配
  for (const [key, value] of Object.entries(errorMap)) {
    if (error.toLowerCase().includes(key.toLowerCase())) {
      return value
    }
  }
  
  // 默认返回原始错误或通用提示
  return error || '登录失败，请稍后重试'
}

interface OAuthProviders {
  wechat: boolean
  qq: boolean
}

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [oauthProviders, setOauthProviders] = useState<OAuthProviders>({ wechat: false, qq: false })
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const isExpired = searchParams.get('expired') === 'true'

  // 显示会话过期提示
  useEffect(() => {
    if (isExpired) {
      setError('登录已过期，请重新登录')
    }
  }, [isExpired])

  // 获取已启用的OAuth登录方式
  useEffect(() => {
    const fetchOAuthProviders = async () => {
      try {
        const response = await fetch('/api/oauth/providers')
        const data = await response.json()
        if (data.success) {
          setOauthProviders({
            wechat: data.data.includes('wechat'),
            qq: data.data.includes('qq'),
          })
        }
      } catch (error) {
        console.error('获取OAuth配置失败:', error)
      }
    }
    fetchOAuthProviders()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await login(email, password)
      if (result.success) {
        router.push(redirect)
      } else {
        setError(translateError(result.error || ''))
      }
    } catch {
      setError('登录失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 发起OAuth登录
  const handleOAuthLogin = (provider: 'wechat' | 'qq') => {
    // 获取当前域名
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
    const redirectUri = encodeURIComponent(`${baseUrl}/api/oauth/callback/${provider}`)
    
    if (provider === 'wechat') {
      // 微信登录
      window.location.href = `/api/oauth/authorize/wechat?redirect_uri=${redirectUri}&state=${encodeURIComponent(redirect)}`
    } else if (provider === 'qq') {
      // QQ登录
      window.location.href = `/api/oauth/authorize/qq?redirect_uri=${redirectUri}&state=${encodeURIComponent(redirect)}`
    }
  }

  const hasOAuth = oauthProviders.wechat || oauthProviders.qq

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <Image
            src="/logo.png"
            alt="蚂蚁AI导航"
            width={48}
            height={48}
            className="h-12 w-12 rounded-xl"
          />
        </div>
        <CardTitle className="text-2xl font-bold">欢迎回来</CardTitle>
        <CardDescription>
          登录你的蚂蚁AI导航账号
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              placeholder="请输入邮箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 pt-6">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            登录
          </Button>
          
          {/* 社交登录 */}
          {hasOAuth && (
            <>
              <div className="flex items-center gap-2 w-full">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground">或使用以下方式登录</span>
                <Separator className="flex-1" />
              </div>
              
              <div className="flex gap-3 w-full">
                {oauthProviders.wechat && (
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleOAuthLogin('wechat')}
                  >
                    <span className="mr-2 text-lg">💬</span>
                    微信登录
                  </Button>
                )}
                {oauthProviders.qq && (
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleOAuthLogin('qq')}
                  >
                    <span className="mr-2 text-lg">🐧</span>
                    QQ登录
                  </Button>
                )}
              </div>
            </>
          )}
          
          <p className="text-sm text-center text-muted-foreground">
            还没有账号？{' '}
            <Link href="/register" className="text-primary hover:underline">
              立即注册
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}

function LoginFormFallback() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <Image
            src="/logo.png"
            alt="蚂蚁AI导航"
            width={48}
            height={48}
            className="h-12 w-12 rounded-xl"
          />
        </div>
        <CardTitle className="text-2xl font-bold">欢迎回来</CardTitle>
        <CardDescription>
          登录你的蚂蚁AI导航账号
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </CardContent>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <Suspense fallback={<LoginFormFallback />}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
