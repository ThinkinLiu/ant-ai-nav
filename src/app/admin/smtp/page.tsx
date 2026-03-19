'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Mail, Save, Send, Loader2, Settings } from 'lucide-react'

interface SMTPSettings {
  id: number
  host: string
  port: number
  secure: boolean
  user_name: string
  password: string
  from_email: string
  from_name: string
  is_active: boolean
}

export default function SMTPSettingsPage() {
  const { token } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [settings, setSettings] = useState<SMTPSettings>({
    id: 0,
    host: '',
    port: 587,
    secure: true,
    user_name: '',
    password: '',
    from_email: '',
    from_name: '蚂蚁AI导航',
    is_active: true,
  })

  useEffect(() => {
    fetchSettings()
  }, [token])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/smtp-settings', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success && data.data) {
        setSettings({
          ...data.data,
          password: '', // 清空密码，避免显示占位符
        })
      }
    } catch (error) {
      console.error('获取SMTP配置失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!settings.host || !settings.user_name || !settings.from_email) {
      toast.error('请填写必填项')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/admin/smtp-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      })
      const data = await response.json()
      if (data.success) {
        toast.success('SMTP配置保存成功')
      } else {
        toast.error(data.error || '保存失败')
      }
    } catch (error) {
      console.error('保存SMTP配置失败:', error)
      toast.error('保存失败，请稍后重试')
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    setTesting(true)
    try {
      const response = await fetch('/api/admin/smtp-settings', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        toast.success('SMTP配置验证通过')
      } else {
        toast.error(data.error || '验证失败')
      }
    } catch (error) {
      console.error('测试SMTP配置失败:', error)
      toast.error('验证失败，请稍后重试')
    } finally {
      setTesting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <CardTitle>SMTP邮件服务配置</CardTitle>
          </div>
          <CardDescription>
            配置邮件服务器，用于发送注册验证码等邮件通知
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 服务器配置 */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">服务器设置</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="host">
                  SMTP服务器 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="host"
                  placeholder="例如：smtp.qq.com"
                  value={settings.host}
                  onChange={(e) => setSettings({ ...settings, host: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="port">
                  端口 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="port"
                  type="number"
                  placeholder="587"
                  value={settings.port}
                  onChange={(e) => setSettings({ ...settings, port: parseInt(e.target.value) || 587 })}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="secure"
                checked={settings.secure}
                onCheckedChange={(checked) => setSettings({ ...settings, secure: checked })}
              />
              <Label htmlFor="secure">启用SSL/TLS加密</Label>
            </div>
          </div>

          {/* 认证配置 */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">认证设置</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="user_name">
                  用户名 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="user_name"
                  placeholder="邮箱地址"
                  value={settings.user_name}
                  onChange={(e) => setSettings({ ...settings, user_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">
                  密码/授权码 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="邮箱密码或授权码"
                  value={settings.password}
                  onChange={(e) => setSettings({ ...settings, password: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* 发件人配置 */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">发件人设置</h3>
            <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-sm text-yellow-800 dark:text-yellow-200">
              <strong>重要提示：</strong>发件人邮箱必须与用户名（SMTP认证账号）一致，否则邮件发送会失败。
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from_email">
                  发件人邮箱 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="from_email"
                  type="email"
                  placeholder="与用户名相同"
                  value={settings.from_email}
                  onChange={(e) => setSettings({ ...settings, from_email: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">请填写与用户名相同的邮箱地址</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="from_name">发件人名称</Label>
                <Input
                  id="from_name"
                  placeholder="蚂蚁AI导航"
                  value={settings.from_name}
                  onChange={(e) => setSettings({ ...settings, from_name: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-3 pt-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              保存配置
            </Button>
            <Button variant="outline" onClick={handleTest} disabled={testing}>
              {testing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              验证配置
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 帮助说明 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            <CardTitle>常见邮箱SMTP配置</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">QQ邮箱</h4>
                <p className="text-muted-foreground">服务器：smtp.qq.com</p>
                <p className="text-muted-foreground">端口：587 或 465</p>
                <p className="text-muted-foreground">密码：需使用授权码</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">163邮箱</h4>
                <p className="text-muted-foreground">服务器：smtp.163.com</p>
                <p className="text-muted-foreground">端口：465 或 25</p>
                <p className="text-muted-foreground">密码：需使用授权码</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">阿里邮箱</h4>
                <p className="text-muted-foreground">服务器：smtp.aliyun.com</p>
                <p className="text-muted-foreground">端口：465</p>
                <p className="text-muted-foreground">密码：邮箱密码</p>
              </div>
            </div>
            <p className="text-muted-foreground">
              提示：QQ邮箱、163邮箱等需要在邮箱设置中开启SMTP服务并获取授权码
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
