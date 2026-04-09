'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Globe,
  Save,
  RefreshCw,
  Plus,
  X,
  Info,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'

interface CrossDomainConfig {
  enabled: boolean
  mainDomain: string | null
  mainDomains: string[]
  sharedDomains: string[]
  authSyncTimeout: number
}

export default function CrossDomainConfigPage() {
  const [config, setConfig] = useState<CrossDomainConfig>({
    enabled: false,
    mainDomain: '',
    mainDomains: [],
    sharedDomains: [],
    authSyncTimeout: 5000,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newDomain, setNewDomain] = useState('')
  const [newMainDomain, setNewMainDomain] = useState('')

  // 加载配置
  const loadConfig = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/cross-domain-config')
      const result = await response.json()

      if (result.success) {
        setConfig({
          enabled: result.data.enabled,
          mainDomain: result.data.mainDomain || '',
          mainDomains: result.data.mainDomains || [],
          sharedDomains: result.data.sharedDomains || [],
          authSyncTimeout: result.data.authSyncTimeout || 5000,
        })
      } else {
        toast.error('加载配置失败')
      }
    } catch (error) {
      console.error('加载配置失败:', error)
      toast.error('加载配置失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConfig()
  }, [])

  // 保存配置
  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/cross-domain-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: config.enabled,
          mainDomain: config.mainDomain,
          mainDomains: config.mainDomains,
          sharedDomains: config.sharedDomains,
          authSyncTimeout: config.authSyncTimeout,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('保存成功')
        loadConfig()
      } else {
        toast.error(result.error || '保存失败')
      }
    } catch (error) {
      console.error('保存配置失败:', error)
      toast.error('保存失败')
    } finally {
      setSaving(false)
    }
  }

  // 添加主域名
  const addMainDomain = () => {
    if (!newMainDomain.trim()) return

    // 验证域名格式（支持带点或不带点）
    const domainRegex = /^(\.)?[a-z0-9]+(-[a-z0-9]+)*\.[a-z]{2,}$/i
    if (!domainRegex.test(newMainDomain.trim())) {
      toast.error('域名格式不正确')
      return
    }

    // 检查重复
    const normalizedDomain = newMainDomain.trim().startsWith('.') 
      ? newMainDomain.trim() 
      : `.${newMainDomain.trim()}`
    if (config.mainDomains.some(d => d === normalizedDomain || d === newMainDomain.trim())) {
      toast.error('域名已存在')
      return
    }

    setConfig({
      ...config,
      mainDomains: [...config.mainDomains, normalizedDomain],
    })
    setNewMainDomain('')
  }

  // 删除主域名
  const removeMainDomain = (domain: string) => {
    setConfig({
      ...config,
      mainDomains: config.mainDomains.filter(d => d !== domain),
    })
  }

  // 添加域名
  const addDomain = () => {
    if (!newDomain.trim()) return

    // 验证域名格式
    const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i
    if (!domainRegex.test(newDomain.trim())) {
      toast.error('域名格式不正确')
      return
    }

    // 检查重复
    if (config.sharedDomains.includes(newDomain.trim())) {
      toast.error('域名已存在')
      return
    }

    setConfig({
      ...config,
      sharedDomains: [...config.sharedDomains, newDomain.trim()],
    })
    setNewDomain('')
  }

  // 删除域名
  const removeDomain = (domain: string) => {
    setConfig({
      ...config,
      sharedDomains: config.sharedDomains.filter(d => d !== domain),
    })
  }

  // 重置配置
  const handleReset = () => {
    setConfig({
      enabled: false,
      mainDomain: '',
      mainDomains: [],
      sharedDomains: [],
      authSyncTimeout: 5000,
    })
    toast.info('配置已重置，请点击保存')
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                跨域名认证配置
              </CardTitle>
              <CardDescription>
                配置多个域名间共享登录状态
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadConfig}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              刷新
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 启用开关 */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>启用跨域认证</Label>
              <p className="text-sm text-muted-foreground">
                开启后，配置的域名将共享登录状态
              </p>
            </div>
            <Switch
              checked={config.enabled}
              onCheckedChange={(checked) =>
                setConfig({ ...config, enabled: checked })
              }
            />
          </div>

          <Separator />

          {/* 多个主域名配置 */}
          <div className="space-y-3">
            <Label>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                主域名列表（子域名共享）
              </div>
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="例如：example.com 或 .example.com"
                value={newMainDomain}
                onChange={(e) => setNewMainDomain(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addMainDomain()}
                disabled={!config.enabled}
              />
              <Button
                onClick={addMainDomain}
                disabled={!config.enabled || !newMainDomain.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              用于子域名共享。配置主域名后，该主域名下的所有子域名自动共享登录状态。
              支持配置多个不同主域名（如 .itlao5.com, .mayiai.site）。
            </p>
            {config.mainDomains.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {config.mainDomains.map((domain) => (
                  <Badge key={domain} variant="default" className="gap-1 pr-1 bg-green-600">
                    {domain}
                    <button
                      type="button"
                      className="h-3 w-3 cursor-pointer hover:text-destructive rounded-sm flex items-center justify-center"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        removeMainDomain(domain)
                      }}
                      title="删除域名"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            {config.mainDomains.length > 0 && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  已配置 {config.mainDomains.length} 个主域名，共享登录状态
                </AlertDescription>
              </Alert>
            )}
          </div>

          <Separator />

          {/* 兼容：单个主域名（隐藏域） */}
          <input 
            type="hidden" 
            value={config.mainDomain || ''} 
            onChange={() => {}} 
          />

          <Separator />

          {/* 共享域名列表 */}
          <div className="space-y-3">
            <Label>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                共享域名列表（完全不同域名）
              </div>
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="例如：another-site.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addDomain()}
                disabled={!config.enabled}
              />
              <Button
                onClick={addDomain}
                disabled={!config.enabled || !newDomain.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              用于完全不同的域名（如 example.com, another-site.com）。
              列表中的域名将实时同步登录状态。
            </p>
            {config.sharedDomains.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {config.sharedDomains.map((domain) => (
                  <Badge key={domain} variant="secondary" className="gap-1 pr-1">
                    {domain}
                    <button
                      type="button"
                      className="h-3 w-3 cursor-pointer hover:text-destructive rounded-sm flex items-center justify-center"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        removeDomain(domain)
                      }}
                      title="删除域名"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* 同步超时配置 */}
          <div className="space-y-3">
            <Label>
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                同步超时时间（毫秒）
              </div>
            </Label>
            <Input
              type="number"
              min="1000"
              max="30000"
              step="1000"
              value={config.authSyncTimeout}
              onChange={(e) =>
                setConfig({
                  ...config,
                  authSyncTimeout: parseInt(e.target.value) || 5000,
                })
              }
              disabled={!config.enabled}
            />
            <p className="text-sm text-muted-foreground">
              跨域同步的超时时间，默认 5000 毫秒（5秒）。
              建议范围：3000-10000 毫秒
            </p>
          </div>

          <Separator />

          {/* 提示信息 */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p>
                  <strong>子域名共享</strong>：设置主域名后，所有子域名自动共享登录状态，无需额外配置。
                </p>
                <p>
                  <strong>完全不同域名</strong>：需要在每个域名的应用中初始化跨域认证功能。
                </p>
                <p>
                  <strong>优先级</strong>：子域名共享优先于完全不同域名同步。
                </p>
              </div>
            </AlertDescription>
          </Alert>

          {/* 操作按钮 */}
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving || loading}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? '保存中...' : '保存配置'}
            </Button>
            <Button variant="outline" onClick={handleReset}>
              重置
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 配置说明 */}
      <Card>
        <CardHeader>
          <CardTitle>配置说明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              注意事项
            </h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>修改配置后需要点击保存按钮</li>
              <li>配置修改后会自动清除缓存，立即生效</li>
              <li>建议在测试环境验证配置后再应用到生产环境</li>
              <li>确保所有域名都使用 HTTPS（生产环境）</li>
              <li>域名数量建议不超过 10 个</li>
            </ul>
          </div>
          <Separator />
          <div className="space-y-2">
            <h3 className="font-semibold">使用场景</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>
                <strong>子域名共享</strong>：适用于 www.example.com, ai.example.com
              </li>
              <li>
                <strong>完全不同域名</strong>：适用于 example.com, another-site.com
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
