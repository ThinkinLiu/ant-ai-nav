'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Loader2, Settings, MessageCircle } from 'lucide-react'

interface OAuthSetting {
  id: number
  provider: 'wechat' | 'qq'
  app_id: string
  app_secret: string
  is_enabled: boolean
}

const providerInfo = {
  wechat: {
    name: '微信登录',
    icon: '💬',
    description: '使用微信账号快捷登录',
    color: 'bg-green-500',
    appIdLabel: 'AppID',
    appSecretLabel: 'AppSecret',
    helpUrl: 'https://open.weixin.qq.com/',
  },
  qq: {
    name: 'QQ登录',
    icon: '🐧',
    description: '使用QQ账号快捷登录',
    color: 'bg-blue-500',
    appIdLabel: 'APP ID',
    appSecretLabel: 'APP Key',
    helpUrl: 'https://connect.qq.com/',
  },
}

export default function OAuthSettingsPage() {
  const [settings, setSettings] = useState<OAuthSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        toast.error('请先登录')
        return
      }
      const response = await fetch('/api/admin/oauth-settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        // 确保两个提供商都有配置
        const existingProviders = data.data.map((s: OAuthSetting) => s.provider)
        const allSettings: OAuthSetting[] = ['wechat', 'qq'].map(provider => {
          const existing = data.data.find((s: OAuthSetting) => s.provider === provider)
          return existing || {
            id: 0,
            provider: provider as 'wechat' | 'qq',
            app_id: '',
            app_secret: '',
            is_enabled: false,
          }
        })
        setSettings(allSettings)
      } else {
        toast.error(data.error || '获取配置失败')
      }
    } catch (error) {
      toast.error('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (provider: 'wechat' | 'qq') => {
    const setting = settings.find(s => s.provider === provider)
    if (!setting) return

    if (!setting.app_id) {
      toast.error('请填写AppID')
      return
    }

    setSaving(provider)
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        toast.error('请先登录')
        return
      }
      const response = await fetch('/api/admin/oauth-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          provider: setting.provider,
          app_id: setting.app_id,
          app_secret: setting.app_secret === '******' ? undefined : setting.app_secret,
          is_enabled: setting.is_enabled,
        }),
      })
      const data = await response.json()
      if (data.success) {
        toast.success(`${providerInfo[provider].name}配置已更新`)
        // 更新本地状态
        setSettings(prev => prev.map(s => 
          s.provider === provider ? { ...s, id: data.data.id, app_secret: '******' } : s
        ))
      } else {
        toast.error(data.error || '保存失败')
      }
    } catch (error) {
      toast.error('网络错误，请稍后重试')
    } finally {
      setSaving(null)
    }
  }

  const updateSetting = (provider: 'wechat' | 'qq', updates: Partial<OAuthSetting>) => {
    setSettings(prev => prev.map(s => 
      s.provider === provider ? { ...s, ...updates } : s
    ))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">社交登录配置</h1>
        <p className="text-muted-foreground mt-1">
          配置微信、QQ等第三方登录方式
        </p>
      </div>

      <div className="grid gap-6">
        {settings.map((setting) => {
          const info = providerInfo[setting.provider]
          return (
            <Card key={setting.provider}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${info.color} rounded-lg flex items-center justify-center text-xl`}>
                      {info.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{info.name}</CardTitle>
                      <CardDescription>{info.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {setting.is_enabled && (
                      <Badge variant="default" className="bg-green-500">
                        已启用
                      </Badge>
                    )}
                    <Switch
                      checked={setting.is_enabled}
                      onCheckedChange={(checked) => updateSetting(setting.provider, { is_enabled: checked })}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`${setting.provider}_app_id`}>
                      {info.appIdLabel} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`${setting.provider}_app_id`}
                      placeholder={`请输入${info.appIdLabel}`}
                      value={setting.app_id}
                      onChange={(e) => updateSetting(setting.provider, { app_id: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${setting.provider}_app_secret`}>
                      {info.appSecretLabel} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`${setting.provider}_app_secret`}
                      type="password"
                      placeholder={setting.app_secret === '******' ? '已设置，留空则不修改' : `请输入${info.appSecretLabel}`}
                      value={setting.app_secret === '******' ? '' : setting.app_secret}
                      onChange={(e) => updateSetting(setting.provider, { app_secret: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4">
                  <a
                    href={info.helpUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    如何获取{info.name}配置？
                  </a>
                  <Button
                    onClick={() => handleSave(setting.provider)}
                    disabled={saving === setting.provider}
                  >
                    {saving === setting.provider && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    保存配置
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 配置说明 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">配置说明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div>
            <h4 className="font-medium text-foreground mb-2">微信登录</h4>
            <ol className="list-decimal list-inside space-y-1">
              <li>前往 <a href="https://open.weixin.qq.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">微信开放平台</a> 注册开发者账号</li>
              <li>创建网站应用，获取 AppID 和 AppSecret</li>
              <li>配置授权回调域名：您的网站域名</li>
              <li>填写上方配置并启用</li>
            </ol>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-2">QQ登录</h4>
            <ol className="list-decimal list-inside space-y-1">
              <li>前往 <a href="https://connect.qq.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">QQ互联</a> 注册开发者账号</li>
              <li>创建网站应用，获取 APP ID 和 APP Key</li>
              <li>配置授权回调地址：您的网站域名/api/oauth/callback/qq</li>
              <li>填写上方配置并启用</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
