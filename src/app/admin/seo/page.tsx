'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Save, Globe, Share2, Search, Code, BarChart3, Loader2 } from 'lucide-react'

interface SEOSettings {
  site_name: string
  site_description: string
  site_keywords: string
  site_url: string
  og_title: string
  og_description: string
  og_image: string
  og_type: string
  twitter_card: string
  twitter_site: string
  twitter_creator: string
  structured_data: any
  robots_txt: string
  google_site_verification: string
  baidu_site_verification: string
  google_analytics_id: string
  baidu_analytics_id: string
  la_analytics_id: string
  custom_head_scripts: string
  custom_body_scripts: string
}

export default function SEOSettingsPage() {
  const [settings, setSettings] = useState<SEOSettings>({
    site_name: '',
    site_description: '',
    site_keywords: '',
    site_url: '',
    og_title: '',
    og_description: '',
    og_image: '',
    og_type: 'website',
    twitter_card: 'summary_large_image',
    twitter_site: '',
    twitter_creator: '',
    structured_data: null,
    robots_txt: '',
    google_site_verification: '',
    baidu_site_verification: '',
    google_analytics_id: '',
    baidu_analytics_id: '',
    la_analytics_id: '',
    custom_head_scripts: '',
    custom_body_scripts: ''
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/seo')
      const data = await response.json()
      if (data.data) {
        setSettings(data.data)
      }
    } catch (error) {
      console.error('获取SEO配置失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/seo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      
      if (response.ok) {
        setSaveMessage({ type: 'success', text: 'SEO配置已更新' })
        setTimeout(() => setSaveMessage(null), 3000)
      } else {
        throw new Error('保存失败')
      }
    } catch (error) {
      setSaveMessage({ type: 'error', text: '保存失败，请稍后重试' })
      setTimeout(() => setSaveMessage(null), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const updateField = (field: keyof SEOSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }))
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
          <h1 className="text-2xl font-bold">SEO设置</h1>
          <p className="text-muted-foreground">配置网站搜索引擎优化相关设置</p>
        </div>
        <div className="flex items-center gap-4">
          {saveMessage && (
            <span className={`text-sm ${saveMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {saveMessage.text}
            </span>
          )}
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            保存配置
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="basic">
            <Globe className="mr-2 h-4 w-4" />
            基本信息
          </TabsTrigger>
          <TabsTrigger value="social">
            <Share2 className="mr-2 h-4 w-4" />
            社交分享
          </TabsTrigger>
          <TabsTrigger value="search">
            <Search className="mr-2 h-4 w-4" />
            搜索引擎
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="mr-2 h-4 w-4" />
            统计分析
          </TabsTrigger>
          <TabsTrigger value="code">
            <Code className="mr-2 h-4 w-4" />
            自定义代码
          </TabsTrigger>
        </TabsList>

        {/* 基本信息 */}
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>网站基本信息</CardTitle>
              <CardDescription>设置网站的基本SEO信息，将显示在搜索结果中</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="site_name">网站名称</Label>
                  <Input
                    id="site_name"
                    value={settings.site_name}
                    onChange={(e) => updateField('site_name', e.target.value)}
                    placeholder="蚂蚁AI导航"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="site_url">网站URL</Label>
                  <Input
                    id="site_url"
                    value={settings.site_url}
                    onChange={(e) => updateField('site_url', e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="site_description">网站描述</Label>
                <Textarea
                  id="site_description"
                  value={settings.site_description}
                  onChange={(e) => updateField('site_description', e.target.value)}
                  placeholder="描述网站的主要内容和服务..."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">建议150-160字符，将显示在搜索结果中</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="site_keywords">关键词</Label>
                <Input
                  id="site_keywords"
                  value={settings.site_keywords}
                  onChange={(e) => updateField('site_keywords', e.target.value)}
                  placeholder="AI导航,AI工具,人工智能..."
                />
                <p className="text-xs text-muted-foreground">多个关键词用英文逗号分隔</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 社交分享 */}
        <TabsContent value="social">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Open Graph</CardTitle>
                <CardDescription>设置在社交媒体（如微信、微博、Facebook）分享时显示的信息</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="og_title">分享标题</Label>
                  <Input
                    id="og_title"
                    value={settings.og_title}
                    onChange={(e) => updateField('og_title', e.target.value)}
                    placeholder="蚂蚁AI导航 - 发现最好的AI工具"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="og_description">分享描述</Label>
                  <Textarea
                    id="og_description"
                    value={settings.og_description}
                    onChange={(e) => updateField('og_description', e.target.value)}
                    placeholder="分享时显示的描述文字..."
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="og_image">分享图片</Label>
                  <Input
                    id="og_image"
                    value={settings.og_image}
                    onChange={(e) => updateField('og_image', e.target.value)}
                    placeholder="https://example.com/og-image.png"
                  />
                  <p className="text-xs text-muted-foreground">建议尺寸：1200x630像素</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Twitter Card</CardTitle>
                <CardDescription>设置在Twitter分享时显示的卡片样式</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="twitter_card">卡片类型</Label>
                    <select
                      id="twitter_card"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={settings.twitter_card}
                      onChange={(e) => updateField('twitter_card', e.target.value)}
                    >
                      <option value="summary">Summary</option>
                      <option value="summary_large_image">Summary Large Image</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter_site">Twitter账号</Label>
                    <Input
                      id="twitter_site"
                      value={settings.twitter_site}
                      onChange={(e) => updateField('twitter_site', e.target.value)}
                      placeholder="@youraccount"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter_creator">创作者账号</Label>
                    <Input
                      id="twitter_creator"
                      value={settings.twitter_creator}
                      onChange={(e) => updateField('twitter_creator', e.target.value)}
                      placeholder="@creator"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 搜索引擎 */}
        <TabsContent value="search">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>站点验证</CardTitle>
                <CardDescription>验证网站所有权，以便使用搜索引擎管理工具</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="google_site_verification">Google站点验证</Label>
                  <Input
                    id="google_site_verification"
                    value={settings.google_site_verification}
                    onChange={(e) => updateField('google_site_verification', e.target.value)}
                    placeholder="Google Search Console验证码"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="baidu_site_verification">百度站点验证</Label>
                  <Input
                    id="baidu_site_verification"
                    value={settings.baidu_site_verification}
                    onChange={(e) => updateField('baidu_site_verification', e.target.value)}
                    placeholder="百度站长平台验证码"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Robots.txt</CardTitle>
                <CardDescription>配置搜索引擎爬虫的访问规则</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={settings.robots_txt}
                  onChange={(e) => updateField('robots_txt', e.target.value)}
                  placeholder="User-agent: *&#10;Allow: /&#10;Sitemap: /sitemap.xml"
                  rows={8}
                  className="font-mono text-sm"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 统计分析 */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>统计分析工具</CardTitle>
              <CardDescription>配置网站流量分析工具</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="google_analytics_id">Google Analytics ID</Label>
                <Input
                  id="google_analytics_id"
                  value={settings.google_analytics_id}
                  onChange={(e) => updateField('google_analytics_id', e.target.value)}
                  placeholder="G-XXXXXXXXXX 或 UA-XXXXXXXX-X"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="baidu_analytics_id">百度统计ID</Label>
                <Input
                  id="baidu_analytics_id"
                  value={settings.baidu_analytics_id}
                  onChange={(e) => updateField('baidu_analytics_id', e.target.value)}
                  placeholder="百度统计代码ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="la_analytics_id">51la统计ID</Label>
                <Input
                  id="la_analytics_id"
                  value={settings.la_analytics_id}
                  onChange={(e) => updateField('la_analytics_id', e.target.value)}
                  placeholder="51la统计ID（如：K1xxxxxx）"
                />
                <p className="text-xs text-muted-foreground">
                  获取方式：访问 <a href="https://www.51.la" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">51la官网</a> 注册并添加网站后获取统计ID
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 自定义代码 */}
        <TabsContent value="code">
          <Card>
            <CardHeader>
              <CardTitle>自定义代码</CardTitle>
              <CardDescription>添加自定义HTML/JavaScript代码（如第三方工具、广告代码等）</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="custom_head_scripts">头部代码 (&lt;head&gt;)</Label>
                <Textarea
                  id="custom_head_scripts"
                  value={settings.custom_head_scripts}
                  onChange={(e) => updateField('custom_head_scripts', e.target.value)}
                  placeholder="放在<head>标签内的代码..."
                  rows={6}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">将在每个页面的&lt;head&gt;标签中执行</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="custom_body_scripts">底部代码 (&lt;body&gt;)</Label>
                <Textarea
                  id="custom_body_scripts"
                  value={settings.custom_body_scripts}
                  onChange={(e) => updateField('custom_body_scripts', e.target.value)}
                  placeholder="放在<body>标签末尾的代码..."
                  rows={6}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">将在每个页面的&lt;/body&gt;标签前执行</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
