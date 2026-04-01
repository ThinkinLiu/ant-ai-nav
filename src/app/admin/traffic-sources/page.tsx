'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Database, RefreshCw, Check, ExternalLink, Loader2, Settings, Key, Globe, Trophy, MessageCircle, Heart } from 'lucide-react'

interface DataSource {
  id?: number
  name: string
  display_name: string
  api_key?: string
  api_endpoint?: string
  is_active: boolean
  priority: number
  config?: {
    description?: string
    required_fields?: string[]
    api_documentation?: string
    pricing?: string
  }
  last_sync_at?: string
  sync_status?: string
}

interface SiteSettings {
  ranking_enabled: boolean
  ranking_title: string
  ranking_description: string | null
  comments_enabled: boolean
  favorites_enabled: boolean
}

export default function TrafficSourcesPage() {
  const [sources, setSources] = useState<DataSource[]>([])
  const [syncStatus, setSyncStatus] = useState<any>(null)
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    ranking_enabled: true,
    ranking_title: 'AI工具排行榜',
    ranking_description: null,
    comments_enabled: true,
    favorites_enabled: true
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [editingSource, setEditingSource] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<{ api_key: string; api_endpoint: string }>({ api_key: '', api_endpoint: '' })
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [sourcesRes, statusRes, settingsRes] = await Promise.all([
        fetch('/api/admin/traffic-sources'),
        fetch('/api/admin/traffic-sources/sync'),
        fetch('/api/admin/site-settings')
      ])
      
      const sourcesData = await sourcesRes.json()
      const statusData = await statusRes.json()
      const settingsData = await settingsRes.json()
      
      setSources(sourcesData.data || [])
      setSyncStatus(statusData)
      if (settingsData.data) {
        setSiteSettings(settingsData.data)
      }
    } catch (error) {
      console.error('获取数据失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSync = async () => {
    setIsSyncing(true)
    setMessage(null)
    try {
      const response = await fetch('/api/admin/traffic-sources/sync', {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setMessage({ type: 'success', text: data.message })
        fetchData()
      } else {
        setMessage({ type: 'error', text: data.error || '同步失败' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '同步失败，请稍后重试' })
    } finally {
      setIsSyncing(false)
    }
  }

  const handleToggleActive = async (source: DataSource) => {
    setMessage(null)
    
    // 如果要启用，先停用所有数据源
    if (!source.is_active) {
      for (const s of sources) {
        if (s.is_active && s.id) {
          await fetch('/api/admin/traffic-sources', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: s.id, name: s.name, is_active: false })
          })
        }
      }
    }
    
    // 启用或停用当前数据源（使用id或name）
    const response = await fetch('/api/admin/traffic-sources', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: source.id,
        name: source.name,
        display_name: source.display_name,
        api_key: source.api_key,
        api_endpoint: source.api_endpoint,
        is_active: !source.is_active,
        priority: source.priority,
        config: source.config
      })
    })
    
    if (response.ok) {
      setMessage({ type: 'success', text: source.is_active ? '已停用' : '已启用' })
      fetchData()
    } else {
      setMessage({ type: 'error', text: '操作失败' })
    }
  }

  const handleSaveConfig = async (source: DataSource) => {
    const response = await fetch('/api/admin/traffic-sources', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: source.id,
        name: source.name,
        display_name: source.display_name,
        api_key: editForm.api_key || null,
        api_endpoint: editForm.api_endpoint || null,
        is_active: source.is_active,
        priority: source.priority,
        config: source.config
      })
    })
    
    if (response.ok) {
      setEditingSource(null)
      setMessage({ type: 'success', text: '配置已保存' })
      fetchData()
    } else {
      setMessage({ type: 'error', text: '保存失败' })
    }
  }

  const handleSaveSiteSettings = async () => {
    setIsSavingSettings(true)
    try {
      const response = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteSettings)
      })
      
      if (response.ok) {
        setMessage({ type: 'success', text: '功能设置已保存' })
      } else {
        setMessage({ type: 'error', text: '保存失败' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '保存失败' })
    } finally {
      setIsSavingSettings(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">排行榜配置</h1>
          <p className="text-muted-foreground">配置排行榜数据源和功能开关</p>
        </div>
        <div className="flex items-center gap-4">
          {message && (
            <span className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {message.text}
            </span>
          )}
        </div>
      </div>

      {/* 功能开关 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5" />
            功能开关
          </CardTitle>
          <CardDescription>控制网站功能的开启和关闭</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 排行榜开关 */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">AI工具排行榜</div>
                <div className="text-sm text-muted-foreground">关闭后排行榜入口将隐藏，页面不可访问</div>
              </div>
            </div>
            <Switch
              checked={siteSettings.ranking_enabled}
              onCheckedChange={(checked) => setSiteSettings({ ...siteSettings, ranking_enabled: checked })}
            />
          </div>
          
          {siteSettings.ranking_enabled && (
            <div className="grid grid-cols-2 gap-4 pl-4">
              <div className="space-y-2">
                <Label htmlFor="ranking_title">排行榜标题</Label>
                <Input
                  id="ranking_title"
                  value={siteSettings.ranking_title}
                  onChange={(e) => setSiteSettings({ ...siteSettings, ranking_title: e.target.value })}
                  placeholder="AI工具排行榜"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ranking_description">排行榜描述</Label>
                <Input
                  id="ranking_description"
                  value={siteSettings.ranking_description || ''}
                  onChange={(e) => setSiteSettings({ ...siteSettings, ranking_description: e.target.value })}
                  placeholder="描述文字"
                />
              </div>
            </div>
          )}
          
          <div className="flex justify-end">
            <Button onClick={handleSaveSiteSettings} disabled={isSavingSettings}>
              {isSavingSettings ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              保存功能设置
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 同步状态和数据源配置 - 仅在排行榜启用时显示 */}
      {siteSettings.ranking_enabled && (
        <>
          {/* 同步状态 */}
          {syncStatus && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">同步状态</CardTitle>
                  <Button onClick={handleSync} disabled={isSyncing} size="sm">
                    {isSyncing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    立即同步
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">当前数据源:</span>
                  <Badge variant={syncStatus.activeSource?.name === 'mock' ? 'secondary' : 'default'}>
                    {syncStatus.activeSource?.display_name || '模拟数据'}
                  </Badge>
                  {syncStatus.recentUpdates?.[0] && (
                    <>
                      <span className="text-muted-foreground">|</span>
                      <span className="text-muted-foreground">最近更新:</span>
                      <span>{new Date(syncStatus.recentUpdates[0].completed_at).toLocaleString('zh-CN')}</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 数据源列表 */}
          <div className="grid gap-4">
            {sources.map((source) => (
              <Card key={source.name}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg">{source.display_name}</CardTitle>
                      {source.is_active && (
                        <Badge className="bg-green-500">
                          <Check className="mr-1 h-3 w-3" />
                          已启用
                        </Badge>
                      )}
                      {source.config?.pricing && (
                        <Badge variant="outline">{source.config.pricing}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {source.name !== 'mock' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingSource(source.name)
                            setEditForm({
                              api_key: source.api_key || '',
                              api_endpoint: source.api_endpoint || ''
                            })
                          }}
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          配置
                        </Button>
                      )}
                      <Button
                        variant={source.is_active ? 'destructive' : 'default'}
                        size="sm"
                        onClick={() => handleToggleActive(source)}
                        disabled={source.name !== 'mock' && !source.api_key && !source.is_active}
                      >
                        {source.is_active ? '停用' : '启用'}
                      </Button>
                    </div>
                  </div>
                  <CardDescription>{source.config?.description}</CardDescription>
                </CardHeader>
                
                {editingSource === source.name && (
                  <CardContent className="border-t pt-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`api_key_${source.name}`}>
                            <Key className="mr-2 h-4 w-4 inline" />
                            API Key
                          </Label>
                          <Input
                            id={`api_key_${source.name}`}
                            type="password"
                            placeholder="输入API密钥"
                            value={editForm.api_key}
                            onChange={(e) => setEditForm({ ...editForm, api_key: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`endpoint_${source.name}`}>
                            <Globe className="mr-2 h-4 w-4 inline" />
                            API Endpoint（可选）
                          </Label>
                          <Input
                            id={`endpoint_${source.name}`}
                            placeholder="自定义API端点"
                            value={editForm.api_endpoint}
                            onChange={(e) => setEditForm({ ...editForm, api_endpoint: e.target.value })}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        {source.config?.api_documentation && (
                          <a
                            href={source.config.api_documentation}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="h-4 w-4" />
                            API文档
                          </a>
                        )}
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setEditingSource(null)}>
                            取消
                          </Button>
                          <Button size="sm" onClick={() => handleSaveConfig(source)}>
                            保存配置
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {/* 使用说明 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">使用说明</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>1. 选择一个数据源，点击"配置"填写API密钥</p>
              <p>2. 点击"启用"激活该数据源</p>
              <p>3. 点击"立即同步"或等待每日自动同步</p>
              <p>4. 数据源按优先级排序，SimilarWeb &gt; SEMrush &gt; Ahrefs &gt; 模拟数据</p>
              <p className="text-amber-600">⚠️ 注意：SimilarWeb、SEMrush、Ahrefs 均为付费API，需要先购买服务获取API密钥</p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
