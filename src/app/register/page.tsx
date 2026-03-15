'use client'

import { useState, Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { Eye, EyeOff, Loader2, Mail, Send } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'

// 英文错误信息翻译为中文
const translateError = (error: string): string => {
  const errorMap: Record<string, string> = {
    'User already registered': '该邮箱已被注册',
    'Email already registered': '该邮箱已被注册',
    'Password should be at least 6 characters': '密码长度至少6位',
    'Invalid email': '邮箱格式不正确',
    'Invalid password': '密码格式不正确',
    'Email not confirmed': '邮箱未验证',
    'Too many requests': '注册请求过于频繁，请稍后再试',
    'User not found': '用户不存在',
    'Signup is disabled': '注册功能已关闭',
    'Unable to validate email address': '邮箱地址无效',
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
  return error || '注册失败，请稍后重试'
}

function RegisterForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSendingCode, setIsSendingCode] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [emailVerified, setEmailVerified] = useState(false)
  const { register } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  // 倒计时效果
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // 发送验证码
  const handleSendCode = async () => {
    if (!email) {
      toast.error('请输入邮箱地址')
      return
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('邮箱格式不正确')
      return
    }

    setIsSendingCode(true)
    try {
      const response = await fetch('/api/email/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'register' }),
      })
      const data = await response.json()
      if (data.success) {
        toast.success('验证码已发送，请查收邮件')
        setCountdown(60) // 60秒倒计时
      } else {
        toast.error(data.error || '发送失败')
      }
    } catch {
      toast.error('发送失败，请稍后重试')
    } finally {
      setIsSendingCode(false)
    }
  }

  // 验证验证码
  const handleVerifyCode = async () => {
    if (!verificationCode) {
      toast.error('请输入验证码')
      return false
    }

    try {
      const response = await fetch('/api/email/send-verification', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode, type: 'register' }),
      })
      const data = await response.json()
      if (data.success) {
        setEmailVerified(true)
        toast.success('邮箱验证成功')
        return true
      } else {
        toast.error(data.error || '验证码无效')
        return false
      }
    } catch {
      toast.error('验证失败，请稍后重试')
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // 验证邮箱
    if (!emailVerified) {
      const verified = await handleVerifyCode()
      if (!verified) return
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    if (password.length < 6) {
      setError('密码长度至少6位')
      return
    }

    setIsLoading(true)

    try {
      const result = await register(email, password, name)
      if (result.success) {
        router.push(redirect)
      } else {
        setError(translateError(result.error || ''))
      }
    } catch {
      setError('注册失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

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
        <CardTitle className="text-2xl font-bold">创建账号</CardTitle>
        <CardDescription>
          注册蚂蚁AI导航，发现更多AI工具
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg">
              {error}
            </div>
          )}
          
          {/* 用户名 */}
          <div className="space-y-2">
            <Label htmlFor="name">用户名</Label>
            <Input
              id="name"
              type="text"
              placeholder="请输入用户名"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          {/* 邮箱 */}
          <div className="space-y-2">
            <Label htmlFor="email">
              邮箱 <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                placeholder="请输入邮箱"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setEmailVerified(false)
                }}
                required
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleSendCode}
                disabled={isSendingCode || countdown > 0}
                className="shrink-0"
              >
                {isSendingCode ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : countdown > 0 ? (
                  `${countdown}s`
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-1" />
                    发送
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* 验证码 */}
          <div className="space-y-2">
            <Label htmlFor="verificationCode">
              验证码 <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="verificationCode"
                  type="text"
                  placeholder="请输入邮箱验证码"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  required
                  maxLength={6}
                  className="pl-10"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              {emailVerified && (
                <div className="flex items-center text-green-600 text-sm">
                  <span>已验证</span>
                </div>
              )}
            </div>
          </div>
          
          {/* 密码 */}
          <div className="space-y-2">
            <Label htmlFor="password">
              密码 <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="请输入密码（至少6位）"
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
          
          {/* 确认密码 */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              确认密码 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 pt-6">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            注册
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            已有账号？{' '}
            <Link href="/login" className="text-primary hover:underline">
              立即登录
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}

function RegisterFormFallback() {
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
        <CardTitle className="text-2xl font-bold">创建账号</CardTitle>
        <CardDescription>
          注册蚂蚁AI导航，发现更多AI工具
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </CardContent>
    </Card>
  )
}

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <Suspense fallback={<RegisterFormFallback />}>
        <RegisterForm />
      </Suspense>
    </div>
  )
}
