'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'
import { Eye, EyeOff, Loader2, Phone, Mail } from 'lucide-react'
import Image from 'next/image'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

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

export const dynamic = 'force-dynamic'

function LoginForm() {
  const [loginType, setLoginType] = useState<'email' | 'phone'>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [oauthProviders, setOauthProviders] = useState<OAuthProviders>({ wechat: false, qq: false })
  const [smsEnabled, setSmsEnabled] = useState(false)
  
  // 手机号登录相关
  const [phone, setPhone] = useState('')
  const [smsCode, setSmsCode] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [sendingCode, setSendingCode] = useState(false)
  
  const { login, user, isLoading, triggerAuthRefresh } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const isExpired = searchParams.get('expired') === 'true'

  // 如果用户已登录，自动跳转到首页
  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/')
    }
  }, [isLoading, user, router])

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
        console.log('[OAuth] API响应:', data)
        if (data.success) {
          const providers = {
            wechat: data.data.includes('wechat'),
            qq: data.data.includes('qq'),
          }
          console.log('[OAuth] 设置提供者:', providers)
          setOauthProviders(providers)
        }
      } catch (error) {
        console.error('获取OAuth配置失败:', error)
      }
    }
    fetchOAuthProviders()
  }, [])

  // 检查短信登录是否启用
  useEffect(() => {
    const fetchSmsStatus = async () => {
      try {
        const response = await fetch('/api/sms/status')
        const data = await response.json()
        if (data.success) {
          setSmsEnabled(data.enabled)
        }
      } catch (error) {
        console.error('获取短信配置失败:', error)
      }
    }
    fetchSmsStatus()
  }, [])

  // 倒计时
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // 邮箱密码登录
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const result = await login(email, password)
      if (result.success) {
        // 登录成功后使用软刷新，AuthContext 已触发 refreshTrigger
        // 使用 router.push 而非 window.location.href 避免页面闪烁
        toast.success('登录成功')
        if (redirect === '/' || redirect === '/login') {
          router.push('/')
        } else {
          router.push(redirect)
        }
      } else {
        setError(translateError(result.error || ''))
      }
    } catch {
      setError('登录失败，请稍后重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 发送短信验证码
  const handleSendSmsCode = async () => {
    if (!phone) {
      toast.error('请输入手机号码')
      return
    }

    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(phone)) {
      toast.error('手机号码格式不正确')
      return
    }

    setSendingCode(true)
    try {
      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, type: 'login' }),
      })
      const data = await response.json()
      if (data.success) {
        toast.success('验证码已发送')
        setCountdown(60)
      } else {
        toast.error(data.error || '发送失败')
      }
    } catch {
      toast.error('发送失败，请稍后重试')
    } finally {
      setSendingCode(false)
    }
  }

  // 手机号登录
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/phone-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: smsCode }),
      })
      const data = await response.json()
      
      if (data.success) {
        // 保存token到localStorage
        localStorage.setItem('auth_token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        // 初始化活动时间
        const now = Date.now()
        localStorage.setItem('last_activity_time', now.toString())
        
        if (data.isNewUser) {
          toast.success('注册成功，欢迎加入！')
        } else {
          toast.success('登录成功')
        }
        
        // 触发 AuthContext 刷新，替代硬刷新
        triggerAuthRefresh()
        
        // 使用软刷新跳转到目标页面
        router.push(redirect)
        return
      } else {
        setError(data.error || '登录失败')
      }
    } catch {
      setError('登录失败，请稍后重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 发起OAuth登录
  const handleOAuthLogin = (provider: 'wechat' | 'qq') => {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
    const redirectUri = encodeURIComponent(`${baseUrl}/api/oauth/callback/${provider}`)
    
    if (provider === 'wechat') {
      window.location.href = `/api/oauth/authorize/wechat?redirect_uri=${redirectUri}&state=${encodeURIComponent(redirect)}`
    } else if (provider === 'qq') {
      window.location.href = `/api/oauth/authorize/qq?redirect_uri=${redirectUri}&state=${encodeURIComponent(redirect)}`
    }
  }

  const hasOAuth = oauthProviders.wechat || oauthProviders.qq
  console.log('[OAuth] hasOAuth:', hasOAuth, 'providers:', oauthProviders)

  return (
    <Card className="w-full max-w-md">
      <Tabs value={loginType} onValueChange={(v) => setLoginType(v as 'email' | 'phone')}>
        <CardHeader className="space-y-4 text-center pb-0">
          <div className="flex justify-center mb-2">
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
          
          {/* 只有短信服务启用时才显示Tab切换 */}
          {smsEnabled && (
            <TabsList className="grid w-full grid-cols-2 mt-2">
              <TabsTrigger value="email" className="gap-1.5">
                <Mail className="h-4 w-4" />
                邮箱登录
              </TabsTrigger>
              <TabsTrigger value="phone" className="gap-1.5">
                <Phone className="h-4 w-4" />
                手机登录
              </TabsTrigger>
            </TabsList>
          )}
        </CardHeader>
        
        <TabsContent value="email" className="mt-0">
          <form onSubmit={handleEmailSubmit}>
            <CardContent className="space-y-4 pt-6">
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
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
        </TabsContent>
        
        {smsEnabled && (
          <TabsContent value="phone" className="mt-0">
            <form onSubmit={handlePhoneSubmit}>
              <CardContent className="space-y-4 pt-6">
                {error && (
                  <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="phone">手机号</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="请输入手机号"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smsCode">验证码</Label>
                  <div className="flex gap-2">
                    <Input
                      id="smsCode"
                      type="text"
                      placeholder="请输入验证码"
                      value={smsCode}
                      onChange={(e) => setSmsCode(e.target.value)}
                      maxLength={6}
                      required
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSendSmsCode}
                      disabled={countdown > 0 || sendingCode}
                      className="shrink-0"
                    >
                      {sendingCode ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : countdown > 0 ? (
                        `${countdown}秒`
                      ) : (
                        '获取验证码'
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4 pt-6">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
                  首次登录将自动注册账号
                </p>
              </CardFooter>
            </form>
          </TabsContent>
        )}
      </Tabs>
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
