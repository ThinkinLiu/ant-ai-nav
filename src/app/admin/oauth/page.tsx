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

// QQ图标组件
function QQIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 1024 1024" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M513.2273 509.74358m-301.216175 301.216175a425.984 425.984 0 1 0 602.43235-602.43235 425.984 425.984 0 1 0-602.43235 602.43235Z" fill="#5A8DFF"/>
      <path d="M383.5392 657.5616l-31.9488-58.112a99.6352 99.6352 0 0 1-6.8096 10.24 183.808 183.808 0 0 1-18.432 19.9168c-5.9904 5.12-11.4176 3.4304-14.5408-3.9936a71.2704 71.2704 0 0 1-4.3008-40.192 167.5264 167.5264 0 0 1 45.1072-86.6816 12.5952 12.5952 0 0 0 3.7376-10.5472 79.1552 79.1552 0 0 1 5.12-40.96 20.48 20.48 0 0 1 5.4272-8.2944 14.4896 14.4896 0 0 0 5.4784-12.7488 179.2 179.2 0 0 1 19.3536-75.264c21.504-40.0384 56.32-62.0544 99.9424-68.5056 50.176-7.3216 93.696 7.424 127.6928 46.08 21.8112 24.7296 30.2592 55.0912 33.9456 87.04q0.4608 3.5328 0.6144 7.0656A22.5792 22.5792 0 0 0 660.48 440.32a37.3248 37.3248 0 0 1 9.3696 25.6c0.4096 7.8336 0 15.7696 0 23.6544a12.9024 12.9024 0 0 0 3.0208 7.68c23.3472 25.6 40.192 54.528 46.08 88.9344a71.68 71.68 0 0 1-3.7376 37.4272c-3.584 9.3696-9.3184 11.3152-16.7936 4.7616a170.752 170.752 0 0 1-16.9472-18.944 121.9584 121.9584 0 0 1-6.8608-10.24l-32.2048 58.624c5.12 3.072 10.9568 6.4 16.4352 10.496a39.424 39.424 0 0 1 16.7424 29.5424c1.0752 13.4144-5.888 24.32-20.0704 31.3344a112.1792 112.1792 0 0 1-45.6192 9.3696 149.9648 149.9648 0 0 1-65.3824-12.0832 86.528 86.528 0 0 1-19.6608-12.9536c-6.0416-4.864-18.0224-5.4272-23.4496 0-10.9056 11.008-24.8832 15.6672-39.3728 19.5072a151.808 151.808 0 0 1-81.92 0 63.1296 63.1296 0 0 1-8.2944-3.2256c-29.5424-13.4656-24.4224-41.9328-10.24-56.0128a183.3472 183.3472 0 0 1 21.9648-16.2304z" fill="#FFFFFF"/>
    </svg>
  )
}

// 微信图标组件
function WechatIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 1024 1024" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M337.387283 341.82659c-17.757225 0-35.514451 11.83815-35.514451 29.595375s17.757225 29.595376 35.514451 29.595376 29.595376-11.83815 29.595376-29.595376c0-18.49711-11.83815-29.595376-29.595376-29.595375zM577.849711 513.479769c-11.83815 0-22.936416 12.578035-22.936416 23.6763 0 12.578035 11.83815 23.676301 22.936416 23.676301 17.757225 0 29.595376-11.83815 29.595376-23.676301s-11.83815-23.676301-29.595376-23.6763zM501.641618 401.017341c17.757225 0 29.595376-12.578035 29.595376-29.595376 0-17.757225-11.83815-29.595376-29.595376-29.595375s-35.514451 11.83815-35.51445 29.595375 17.757225 29.595376 35.51445 29.595376zM706.589595 513.479769c-11.83815 0-22.936416 12.578035-22.936416 23.6763 0 12.578035 11.83815 23.676301 22.936416 23.676301 17.757225 0 29.595376-11.83815 29.595376-23.676301s-11.83815-23.676301-29.595376-23.6763z" fill="#28C445"/>
      <path d="M510.520231 2.959538C228.624277 2.959538 0 231.583815 0 513.479769s228.624277 510.520231 510.520231 510.520231 510.520231-228.624277 510.520231-510.520231-228.624277-510.520231-510.520231-510.520231zM413.595376 644.439306c-29.595376 0-53.271676-5.919075-81.387284-12.578034l-81.387283 41.433526 22.936416-71.768786c-58.450867-41.433526-93.965318-95.445087-93.965317-159.815029 0-113.202312 105.803468-201.988439 233.803468-201.98844 114.682081 0 216.046243 71.028902 236.023121 166.473989-7.398844-0.739884-14.797688-1.479769-22.196532-1.479769-110.982659 1.479769-198.289017 85.086705-198.289017 188.67052 0 17.017341 2.959538 33.294798 7.398844 49.572255-7.398844 0.739884-15.537572 1.479769-22.936416 1.479768z m346.265896 82.867052l17.757225 59.190752-63.630058-35.514451c-22.936416 5.919075-46.612717 11.83815-70.289017 11.83815-111.722543 0-199.768786-76.947977-199.768786-172.393063-0.739884-94.705202 87.306358-171.653179 198.289017-171.65318 105.803468 0 199.028902 77.687861 199.028902 172.393064 0 53.271676-34.774566 100.624277-81.387283 136.138728z" fill="#28C445"/>
    </svg>
  )
}

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
    iconComponent: WechatIcon,
    description: '使用微信账号快捷登录',
    color: 'bg-[#28C445]',
    appIdLabel: 'AppID',
    appSecretLabel: 'AppSecret',
    helpUrl: 'https://open.weixin.qq.com/',
  },
  qq: {
    name: 'QQ登录',
    iconComponent: QQIcon,
    description: '使用QQ账号快捷登录',
    color: 'bg-[#5A8DFF]',
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
                      {info.iconComponent ? <info.iconComponent className="w-6 h-6" /> : info.icon}
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
