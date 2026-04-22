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

// QQ图标组件
function QQIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 1024 1024" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M513.2273 509.74358m-301.216175 301.216175a425.984 425.984 0 1 0 602.43235-602.43235 425.984 425.984 0 1 0-602.43235 602.43235Z" fill="#5A8DFF"/>
      <path d="M383.5392 657.5616l-31.9488-58.112a99.6352 99.6352 0 0 1-6.8096 10.24 183.808 183.808 0 0 1-18.432 19.9168c-5.9904 5.12-11.4176 3.4304-14.5408-3.9936a71.2704 71.2704 0 0 1-4.3008-40.192 167.5264 167.5264 0 0 1 45.1072-86.6816 12.5952 12.5952 0 0 0 3.7376-10.5472 79.1552 79.1552 0 0 1 5.12-40.96 20.48 20.48 0 0 1 5.4272-8.2944 14.4896 14.4896 0 0 0 5.4784-12.7488 179.2 179.2 0 0 1 19.3536-75.264c21.504-40.0384 56.32-62.0544 99.9424-68.5056 50.176-7.3216 93.696 7.424 127.6928 46.08 21.8112 24.7296 30.2592 55.0912 33.9456 87.04q0.4608 3.5328 0.6144 7.0656A22.5792 22.5792 0 0 0 660.48 440.32a37.3248 37.3248 0 0 1 9.3696 25.6c0.4096 7.8336 0 15.7696 0 23.6544a12.9024 12.9024 0 0 0 3.0208 7.68c23.3472 25.6 40.192 54.528 46.08 88.9344a71.68 71.68 0 0 1-3.7376 37.4272c-3.584 9.3696-9.3184 11.3152-16.7936 4.7616a170.752 170.752 0 0 1-16.9472-18.944 121.9584 121.9584 0 0 1-6.8608-10.24l-32.2048 58.624c5.12 3.072 10.9568 6.4 16.4352 10.496a39.424 39.424 0 0 1 16.7424 29.5424c1.0752 13.4144-5.888 24.32-20.0704 31.3344a112.1792 112.1792 0 0 1-45.6192 9.3696 149.9648 149.9648 0 0 1-65.3824-12.0832 86.528 86.528 0 0 1-19.6608-12.9536c-6.0416-4.864-18.0224-5.4272-23.4496 0-10.9056 11.008-24.8832 15.6672-39.3728 19.5072a151.808 151.808 0 0 1-81.92 0 63.1296 63.1296 0 0 1-8.2944-3.2256c-29.5424-13.4656-24.4224-41.9328-10.24-56.0128a183.3472 183.3472 0 0 1 21.9648-16.2304z" fill="#FFFFFF"/>
    </svg>
  )
}

// 微信图标组件
function WechatIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 1024 1024" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M337.387283 341.82659c-17.757225 0-35.514451 11.83815-35.514451 29.595375s17.757225 29.595376 35.514451 29.595376 29.595376-11.83815 29.595376-29.595376c0-18.49711-11.83815-29.595376-29.595376-29.595375zM577.849711 513.479769c-11.83815 0-22.936416 12.578035-22.936416 23.6763 0 12.578035 11.83815 23.676301 22.936416 23.676301 17.757225 0 29.595376-11.83815 29.595376-23.676301s-11.83815-23.676301-29.595376-23.6763zM501.641618 401.017341c17.757225 0 29.595376-12.578035 29.595376-29.595376 0-17.757225-11.83815-29.595376-29.595376-29.595375s-35.514451 11.83815-35.51445 29.595375 17.757225 29.595376 35.51445 29.595376zM706.589595 513.479769c-11.83815 0-22.936416 12.578035-22.936416 23.6763 0 12.578035 11.83815 23.676301 22.936416 23.676301 17.757225 0 29.595376-11.83815 29.595376-23.676301s-11.83815-23.676301-29.595376-23.6763z" fill="#28C445"/>
      <path d="M510.520231 2.959538C228.624277 2.959538 0 231.583815 0 513.479769s228.624277 510.520231 510.520231 510.520231 510.520231-228.624277 510.520231-510.520231-228.624277-510.520231-510.520231-510.520231zM413.595376 644.439306c-29.595376 0-53.271676-5.919075-81.387284-12.578034l-81.387283 41.433526 22.936416-71.768786c-58.450867-41.433526-93.965318-95.445087-93.965317-159.815029 0-113.202312 105.803468-201.988439 233.803468-201.98844 114.682081 0 216.046243 71.028902 236.023121 166.473989-7.398844-0.739884-14.797688-1.479769-22.196532-1.479769-110.982659 1.479769-198.289017 85.086705-198.289017 188.67052 0 17.017341 2.959538 33.294798 7.398844 49.572255-7.398844 0.739884-15.537572 1.479769-22.936416 1.479768z m346.265896 82.867052l17.757225 59.190752-63.630058-35.514451c-22.936416 5.919075-46.612717 11.83815-70.289017 11.83815-111.722543 0-199.768786-76.947977-199.768786-172.393063-0.739884-94.705202 87.306358-171.653179 198.289017-171.65318 105.803468 0 199.028902 77.687861 199.028902 172.393064 0 53.271676-34.774566 100.624277-81.387283 136.138728z" fill="#28C445"/>
    </svg>
  )
}

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
                        <WechatIcon className="mr-2 w-5 h-5" />
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
                        <QQIcon className="mr-2 w-5 h-5" />
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
                          <WechatIcon className="mr-2 w-5 h-5" />
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
                          <QQIcon className="mr-2 w-5 h-5" />
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
