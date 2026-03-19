'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Loader2, Phone, MessageSquare } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface SMSSetting {
  id: number
  provider: 'aliyun' | 'tencent' | 'custom'
  access_key_id: string
  access_key_secret: string
  sign_name: string
  template_code: string
  is_enabled: boolean
  api_url: string
  extra_config: Record<string, any> | null
}

const providerInfo = {
  aliyun: {
    name: '阿里云短信',
    icon: '📱',
    description: '使用阿里云短信服务',
    color: 'bg-orange-500',
    helpUrl: 'https://dysms.console.aliyun.com/',
    accessKeyIdLabel: 'AccessKey ID',
    accessKeySecretLabel: 'AccessKey Secret',
  },
  tencent: {
    name: '腾讯云短信',
    icon: '💬',
    description: '使用腾讯云短信服务',
    color: 'bg-blue-500',
    helpUrl: 'https://console.cloud.tencent.com/smsv2',
    accessKeyIdLabel: 'SecretId',
    accessKeySecretLabel: 'SecretKey',
  },
  custom: {
    name: '自定义接口',
    icon: '🔧',
    description: '使用自定义HTTP接口',
    color: 'bg-gray-500',
    helpUrl: '#',
    accessKeyIdLabel: 'API Key',
    accessKeySecretLabel: 'API Secret',
  },
}

export default function SMSSettingsPage() {
  const [settings, setSettings] = useState<SMSSetting[]>([])
  const [selectedProvider, setSelectedProvider] = useState<'aliyun' | 'tencent' | 'custom'>('aliyun')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    access_key_id: '',
    access_key_secret: '',
    sign_name: '',
    template_code: '',
    is_enabled: false,
    api_url: '',
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  useEffect(() => {
    // 当选择不同的服务商时，加载对应的配置
    const setting = settings.find(s => s.provider === selectedProvider)
    if (setting) {
      setFormData({
        access_key_id: setting.access_key_id || '',
        access_key_secret: setting.access_key_secret ? '******' : '',
        sign_name: setting.sign_name || '',
        template_code: setting.template_code || '',
        is_enabled: setting.is_enabled,
        api_url: setting.api_url || '',
      })
    } else {
      setFormData({
        access_key_id: '',
        access_key_secret: '',
        sign_name: '',
        template_code: '',
        is_enabled: false,
        api_url: '',
      })
    }
  }, [selectedProvider, settings])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        toast.error('请先登录')
        return
      }
      const response = await fetch('/api/admin/sms-settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        setSettings(data.data)
        // 默认选择第一个有配置的服务商，否则选择阿里云
        if (data.data.length > 0) {
          setSelectedProvider(data.data[0].provider)
        }
      } else {
        toast.error(data.error || '获取配置失败')
      }
    } catch (error) {
      toast.error('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.access_key_id) {
      toast.error('请填写AccessKey ID')
      return
    }

    if (!formData.sign_name || !formData.template_code) {
      toast.error('请填写短信签名和模板ID')
      return
    }

    setSaving(true)
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        toast.error('请先登录')
        return
      }
      const response = await fetch('/api/admin/sms-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          provider: selectedProvider,
          access_key_id: formData.access_key_id,
          access_key_secret: formData.access_key_secret === '******' ? undefined : formData.access_key_secret,
          sign_name: formData.sign_name,
          template_code: formData.template_code,
          is_enabled: formData.is_enabled,
          api_url: formData.api_url,
        }),
      })
      const data = await response.json()
      if (data.success) {
        toast.success('短信配置保存成功')
        fetchSettings()
      } else {
        toast.error(data.error || '保存失败')
      }
    } catch (error) {
      toast.error('网络错误，请稍后重试')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const currentProvider = providerInfo[selectedProvider]
  const currentSetting = settings.find(s => s.provider === selectedProvider)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">短信服务配置</h1>
        <p className="text-muted-foreground mt-1">
          配置短信服务，用于发送手机验证码登录
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">选择短信服务商</CardTitle>
          <CardDescription>
            支持阿里云、腾讯云短信服务或自定义HTTP接口
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedProvider}
            onValueChange={(value) => setSelectedProvider(value as 'aliyun' | 'tencent' | 'custom')}
          >
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="选择服务商" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(providerInfo).map(([key, info]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <span>{info.icon}</span>
                    <span>{info.name}</span>
                    {settings.find(s => s.provider === key && s.is_enabled) && (
                      <Badge variant="default" className="ml-2 bg-green-500 text-xs">已启用</Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${currentProvider.color} rounded-lg flex items-center justify-center text-xl`}>
                {currentProvider.icon}
              </div>
              <div>
                <CardTitle className="text-lg">{currentProvider.name}</CardTitle>
                <CardDescription>{currentProvider.description}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {formData.is_enabled && (
                <Badge variant="default" className="bg-green-500">
                  已启用
                </Badge>
              )}
              <Switch
                checked={formData.is_enabled}
                onCheckedChange={(checked) => setFormData({ ...formData, is_enabled: checked })}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="access_key_id">
                {currentProvider.accessKeyIdLabel} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="access_key_id"
                placeholder={`请输入${currentProvider.accessKeyIdLabel}`}
                value={formData.access_key_id}
                onChange={(e) => setFormData({ ...formData, access_key_id: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="access_key_secret">
                {currentProvider.accessKeySecretLabel} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="access_key_secret"
                type="password"
                placeholder={formData.access_key_secret === '******' ? '已设置，留空则不修改' : `请输入${currentProvider.accessKeySecretLabel}`}
                value={formData.access_key_secret === '******' ? '' : formData.access_key_secret}
                onChange={(e) => setFormData({ ...formData, access_key_secret: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sign_name">
                短信签名 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="sign_name"
                placeholder="例如：蚂蚁AI导航"
                value={formData.sign_name}
                onChange={(e) => setFormData({ ...formData, sign_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template_code">
                短信模板ID <span className="text-red-500">*</span>
              </Label>
              <Input
                id="template_code"
                placeholder="例如：SMS_123456789"
                value={formData.template_code}
                onChange={(e) => setFormData({ ...formData, template_code: e.target.value })}
              />
            </div>
          </div>

          {selectedProvider === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="api_url">
                自定义API地址 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="api_url"
                placeholder="https://api.example.com/sms/send"
                value={formData.api_url}
                onChange={(e) => setFormData({ ...formData, api_url: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                自定义API需要支持POST请求，参数包含: phone, code, sign_name, template_code
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-4">
            <a
              href={currentProvider.helpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              如何获取{currentProvider.name}配置？
            </a>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              保存配置
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 配置说明 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">配置说明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div>
            <h4 className="font-medium text-foreground mb-2">阿里云短信</h4>
            <ol className="list-decimal list-inside space-y-1">
              <li>前往 <a href="https://dysms.console.aliyun.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">阿里云短信控制台</a> 开通服务</li>
              <li>申请短信签名和短信模板</li>
              <li>创建 AccessKey，获取 AccessKey ID 和 AccessKey Secret</li>
              <li>填写上方配置并启用</li>
            </ol>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-2">腾讯云短信</h4>
            <ol className="list-decimal list-inside space-y-1">
              <li>前往 <a href="https://console.cloud.tencent.com/smsv2" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">腾讯云短信控制台</a> 开通服务</li>
              <li>申请短信签名和短信正文模板</li>
              <li>创建 API 密钥，获取 SecretId 和 SecretKey</li>
              <li>填写上方配置并启用</li>
            </ol>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <strong>短信模板变量：</strong>验证码模板中需要包含 <code className="bg-muted px-1 rounded">{'{code}'}</code> 变量，系统会自动替换为实际验证码。
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
