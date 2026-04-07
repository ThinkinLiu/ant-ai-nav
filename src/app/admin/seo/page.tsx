'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import RichTextEditor from '@/components/ui/rich-text-editor'
import { Save, Globe, Share2, Search, Code, BarChart3, Loader2, Map, Copyright } from 'lucide-react'

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
  sitemap_enabled: boolean
  sitemap_domain: string
  sitemap_changefreq_default: string
  sitemap_priority_default: string
  sitemap_exclude_paths: string
  sitemap_custom_urls: any
  copyright_enabled: boolean
  copyright_site_name: string
  copyright_url: string
  copyright_text: string
  copyright_icp: string
  copyright_icp_url: string
  copyright_police: string
  copyright_police_url: string
  copyright_additional: string
  copyright_year_start: number
  copyright_year_end: string
  copyright_company_name: string
  copyright_company_email: string
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
    custom_body_scripts: '',
    sitemap_enabled: true,
    sitemap_domain: '',
    sitemap_changefreq_default: 'weekly',
    sitemap_priority_default: '0.5',
    sitemap_exclude_paths: '',
    sitemap_custom_urls: null,
    copyright_enabled: true,
    copyright_site_name: '',
    copyright_url: '',
    copyright_text: '',
    copyright_icp: '',
    copyright_icp_url: '',
    copyright_police: '',
    copyright_police_url: '',
    copyright_additional: '',
    copyright_year_start: 2024,
    copyright_year_end: 'current',
    copyright_company_name: '',
    copyright_company_email: ''
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
        // 将null值转换为空字符串，避免React input报错
        const sanitizedData = {
          ...data.data,
          site_name: data.data.site_name || '',
          site_description: data.data.site_description || '',
          site_keywords: data.data.site_keywords || '',
          site_url: data.data.site_url || '',
          og_title: data.data.og_title || '',
          og_description: data.data.og_description || '',
          og_image: data.data.og_image || '',
          og_type: data.data.og_type || 'website',
          twitter_card: data.data.twitter_card || 'summary_large_image',
          twitter_site: data.data.twitter_site || '',
          twitter_creator: data.data.twitter_creator || '',
          structured_data: data.data.structured_data || null,
          robots_txt: data.data.robots_txt || '',
          google_site_verification: data.data.google_site_verification || '',
          baidu_site_verification: data.data.baidu_site_verification || '',
          google_analytics_id: data.data.google_analytics_id || '',
          baidu_analytics_id: data.data.baidu_analytics_id || '',
          la_analytics_id: data.data.la_analytics_id || '',
          custom_head_scripts: data.data.custom_head_scripts || '',
          custom_body_scripts: data.data.custom_body_scripts || '',
          sitemap_domain: data.data.sitemap_domain || '',
          sitemap_changefreq_default: data.data.sitemap_changefreq_default || 'weekly',
          sitemap_priority_default: data.data.sitemap_priority_default || '0.5',
          sitemap_exclude_paths: data.data.sitemap_exclude_paths || '',
          sitemap_custom_urls: data.data.sitemap_custom_urls || null,
          copyright_site_name: data.data.copyright_site_name || '',
          copyright_url: data.data.copyright_url || '',
          copyright_text: data.data.copyright_text || '',
          copyright_icp: data.data.copyright_icp || '',
          copyright_icp_url: data.data.copyright_icp_url || '',
          copyright_police: data.data.copyright_police || '',
          copyright_police_url: data.data.copyright_police_url || '',
          copyright_additional: data.data.copyright_additional || '',
          copyright_year_start: data.data.copyright_year_start || new Date().getFullYear(),
          copyright_year_end: data.data.copyright_year_end || 'current',
          copyright_company_name: data.data.copyright_company_name || '',
          copyright_company_email: data.data.copyright_company_email || ''
        }
        setSettings(sanitizedData)
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

  const formatCopyrightYear = (yearStart: number, yearEnd: string): string => {
    const currentYear = new Date().getFullYear()
    
    if (yearEnd === 'current') {
      return `${yearStart} - ${currentYear}`
    }
    
    if (yearEnd === 'forever') {
      return `${yearStart} - 至今`
    }
    
    if (yearEnd && yearEnd !== yearStart.toString()) {
      return `${yearStart} - ${yearEnd}`
    }
    
    return yearStart.toString()
  }

  const replaceCopyrightPlaceholders = (text: string): string => {
    const currentYear = new Date().getFullYear()
    const yearRange = formatCopyrightYear(settings.copyright_year_start, settings.copyright_year_end)
    
    let result = text
    
    // 智能年份范围判断
    // 如果开始年份 >= 今年，年份范围只显示今年
    let smartYearRange: string
    if (settings.copyright_year_start >= currentYear) {
      smartYearRange = currentYear.toString()
    } else {
      smartYearRange = yearRange
    }
    
    // 年份相关占位符
    result = result.replace(/\[年份\]/g, settings.copyright_year_start.toString())
    result = result.replace(/\[year\]/gi, settings.copyright_year_start.toString())
    
    result = result.replace(/\[当前年份\]/g, currentYear.toString())
    result = result.replace(/\[current_year\]/gi, currentYear.toString())
    
    // 年份范围占位符（智能判断）
    result = result.replace(/\[年份范围\]/g, smartYearRange)
    result = result.replace(/\[year_range\]/gi, smartYearRange)
    
    // 智能网站名占位符：如果有URL，自动添加a标签
    let siteNameHtml: string
    if (settings.site_url) {
      siteNameHtml = `<a href="${settings.site_url}" target="_blank" rel="noopener noreferrer" class="hover:text-foreground transition-colors font-medium">${settings.site_name || '蚂蚁AI导航'}</a>`
    } else {
      siteNameHtml = `<span class="font-medium">${settings.site_name || '蚂蚁AI导航'}</span>`
    }
    result = result.replace(/\[网站名\]/g, siteNameHtml)
    result = result.replace(/\[site_name\]/gi, siteNameHtml)
    
    // 公司名称占位符
    if (settings.copyright_company_name) {
      result = result.replace(/\[公司名\]/g, settings.copyright_company_name)
      result = result.replace(/\[company_name\]/gi, settings.copyright_company_name)
    }
    
    // 联系邮箱占位符：自动添加mailto链接
    if (settings.copyright_company_email) {
      const emailHtml = `<a href="mailto:${settings.copyright_company_email}" class="hover:text-foreground transition-colors">${settings.copyright_company_email}</a>`
      result = result.replace(/\[联系邮箱\]/g, emailHtml)
      result = result.replace(/\[email\]/gi, emailHtml)
    }
    
    return result
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
          <TabsTrigger value="sitemap">
            <Map className="mr-2 h-4 w-4" />
            Sitemap配置
          </TabsTrigger>
          <TabsTrigger value="copyright">
            <Copyright className="mr-2 h-4 w-4" />
            版权信息
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

        {/* Sitemap配置 */}
        <TabsContent value="sitemap">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sitemap设置</CardTitle>
                <CardDescription>配置网站地图生成规则，帮助搜索引擎更好地索引您的网站</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="sitemap_enabled"
                    checked={settings.sitemap_enabled}
                    onChange={(e) => updateField('sitemap_enabled', e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="sitemap_enabled" className="cursor-pointer">
                    启用Sitemap自动生成
                  </Label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sitemap_domain">Sitemap域名</Label>
                    <Input
                      id="sitemap_domain"
                      value={settings.sitemap_domain}
                      onChange={(e) => updateField('sitemap_domain', e.target.value)}
                      placeholder="https://example.com"
                      disabled={!settings.sitemap_enabled}
                    />
                    <p className="text-xs text-muted-foreground">
                      Sitemap中使用的域名，留空则使用环境变量或默认值
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sitemap_changefreq_default">默认更新频率</Label>
                    <select
                      id="sitemap_changefreq_default"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={settings.sitemap_changefreq_default}
                      onChange={(e) => updateField('sitemap_changefreq_default', e.target.value)}
                      disabled={!settings.sitemap_enabled}
                    >
                      <option value="always">Always</option>
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                      <option value="never">Never</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sitemap_priority_default">默认优先级</Label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      id="sitemap_priority_default"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settings.sitemap_priority_default}
                      onChange={(e) => updateField('sitemap_priority_default', e.target.value)}
                      disabled={!settings.sitemap_enabled}
                      className="flex-1"
                    />
                    <span className="text-sm font-mono w-16 text-right">
                      {settings.sitemap_priority_default}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    范围：0.0 - 1.0，数值越大优先级越高（默认0.5）
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>路径排除</CardTitle>
                <CardDescription>指定不需要包含在Sitemap中的路径</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sitemap_exclude_paths">排除路径列表</Label>
                  <Textarea
                    id="sitemap_exclude_paths"
                    value={settings.sitemap_exclude_paths}
                    onChange={(e) => updateField('sitemap_exclude_paths', e.target.value)}
                    placeholder="/admin&#10;/api&#10;/login"
                    rows={6}
                    disabled={!settings.sitemap_enabled}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    每行一个路径，例如：/admin、/api、/login。这些路径将被排除在Sitemap之外
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>自定义URL</CardTitle>
                <CardDescription>手动添加额外的URL到Sitemap中</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sitemap_custom_urls">自定义URL列表</Label>
                  <Textarea
                    id="sitemap_custom_urls"
                    value={settings.sitemap_custom_urls ? JSON.stringify(settings.sitemap_custom_urls, null, 2) : ''}
                    onChange={(e) => {
                      try {
                        const value = e.target.value.trim()
                        const parsed = value ? JSON.parse(value) : null
                        updateField('sitemap_custom_urls', parsed)
                      } catch (error) {
                        // JSON格式错误时不更新状态
                        console.warn('JSON格式错误:', error)
                      }
                    }}
                    placeholder={`[
  {
    "url": "/custom-page",
    "lastModified": "2024-01-01",
    "changeFrequency": "weekly",
    "priority": 0.7
  }
]`}
                    rows={10}
                    disabled={!settings.sitemap_enabled}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    JSON格式的URL列表。可选字段：url（必填）、lastModified（YYYY-MM-DD）、changeFrequency、priority
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sitemap预览</CardTitle>
                <CardDescription>查看当前Sitemap配置预览</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">
                    <strong>访问地址：</strong>{' '}
                    <a
                      href="/sitemap.xml"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      /sitemap.xml
                    </a>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    点击链接查看生成的Sitemap文件。修改配置后需要等待缓存刷新（默认1小时）。
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 版权信息配置 */}
        <TabsContent value="copyright">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>版权信息设置</CardTitle>
                <CardDescription>配置网站底部的版权信息和备案信息</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="copyright_enabled"
                    checked={settings.copyright_enabled}
                    onChange={(e) => updateField('copyright_enabled', e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="copyright_enabled" className="cursor-pointer">
                    启用版权信息显示
                  </Label>
                </div>

                {/* 版权年份 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="copyright_year_start">起始年份</Label>
                    <Input
                      id="copyright_year_start"
                      type="number"
                      min="1990"
                      max={new Date().getFullYear()}
                      value={settings.copyright_year_start}
                      onChange={(e) => updateField('copyright_year_start', parseInt(e.target.value))}
                      placeholder="2024"
                      disabled={!settings.copyright_enabled}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="copyright_year_end">结束年份</Label>
                    <select
                      id="copyright_year_end"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={settings.copyright_year_end}
                      onChange={(e) => updateField('copyright_year_end', e.target.value)}
                      disabled={!settings.copyright_enabled}
                    >
                      <option value="current">当前年份（自动）</option>
                      <option value="forever">永久</option>
                      {Array.from({ length: new Date().getFullYear() - 2000 + 1 }, (_, i) => {
                        const year = new Date().getFullYear() - i
                        return (
                          <option key={year} value={year.toString()}>
                            {year}
                          </option>
                        )
                      })}
                    </select>
                  </div>
                </div>

                {/* 版权文本 */}
                <div className="space-y-2">
                  <Label htmlFor="copyright_text">版权声明文本</Label>
                  <RichTextEditor
                    content={settings.copyright_text}
                    onChange={(content) => updateField('copyright_text', content)}
                    disabled={!settings.copyright_enabled}
                    placeholder="输入版权声明文本，支持富文本格式..."
                    minHeight="100px"
                  />
                  <p className="text-xs text-muted-foreground">
                    可选的版权声明文本。支持<strong>粗体</strong>、<em>斜体</em>、<u>下划线</u>、链接等富文本格式。不填则使用默认格式。
                    <br />
                    <strong>可用占位符：</strong>
                    <span className="ml-1">[年份]</span>（起始年份）、
                    <span>[当前年份]</span>（今年）、
                    <span>[年份范围]</span>（智能判断，起始年份大于等于今年则只显示今年）、
                    <span>[网站名]</span>（有URL时自动添加链接）、
                    <span>[公司名]</span>、
                    <span>[联系邮箱]</span>（自动添加mailto链接）
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>备案信息</CardTitle>
                <CardDescription>配置网站备案信息（中国大陆网站必须）</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="copyright_icp">ICP备案号</Label>
                    <Input
                      id="copyright_icp"
                      value={settings.copyright_icp}
                      onChange={(e) => updateField('copyright_icp', e.target.value)}
                      placeholder="京ICP备XXXXXXXX号-X"
                      disabled={!settings.copyright_enabled}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="copyright_icp_url">ICP备案查询链接</Label>
                    <Input
                      id="copyright_icp_url"
                      value={settings.copyright_icp_url}
                      onChange={(e) => updateField('copyright_icp_url', e.target.value)}
                      placeholder="https://beian.miit.gov.cn"
                      disabled={!settings.copyright_enabled}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="copyright_police">公安备案号</Label>
                    <Input
                      id="copyright_police"
                      value={settings.copyright_police}
                      onChange={(e) => updateField('copyright_police', e.target.value)}
                      placeholder="京公网安备 XXXXXXXX号"
                      disabled={!settings.copyright_enabled}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="copyright_police_url">公安备案查询链接</Label>
                    <Input
                      id="copyright_police_url"
                      value={settings.copyright_police_url}
                      onChange={(e) => updateField('copyright_police_url', e.target.value)}
                      placeholder="http://www.beian.gov.cn"
                      disabled={!settings.copyright_enabled}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>公司信息</CardTitle>
                <CardDescription>配置运营主体信息（可选）</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="copyright_company_name">公司/组织名称</Label>
                    <Input
                      id="copyright_company_name"
                      value={settings.copyright_company_name}
                      onChange={(e) => updateField('copyright_company_name', e.target.value)}
                      placeholder="示例：XX科技有限公司"
                      disabled={!settings.copyright_enabled}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="copyright_company_email">联系邮箱</Label>
                    <Input
                      id="copyright_company_email"
                      type="email"
                      value={settings.copyright_company_email}
                      onChange={(e) => updateField('copyright_company_email', e.target.value)}
                      placeholder="contact@example.com"
                      disabled={!settings.copyright_enabled}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>其他信息</CardTitle>
                <CardDescription>添加额外的版权相关信息</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="copyright_additional">附加信息</Label>
                  <Textarea
                    id="copyright_additional"
                    value={settings.copyright_additional}
                    onChange={(e) => updateField('copyright_additional', e.target.value)}
                    placeholder="其他需要显示在版权区域的信息..."
                    rows={3}
                    disabled={!settings.copyright_enabled}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    支持HTML标签，将显示在版权信息下方。支持使用占位符：[年份]、[当前年份]、[年份范围]（智能判断）、[网站名]（有URL时自动添加链接）、[公司名]、[联系邮箱]（自动添加mailto链接）
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>版权信息预览</CardTitle>
                <CardDescription>查看版权信息在底部的显示效果</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-6 bg-muted/30 text-center text-sm text-muted-foreground space-y-2">
                  {settings.copyright_enabled ? (
                    <>
                      {/* 版权文本（包含年份和站点名称） */}
                      {settings.copyright_text ? (
                        <div className="prose prose-sm max-w-none mx-auto" dangerouslySetInnerHTML={{ 
                          __html: replaceCopyrightPlaceholders(settings.copyright_text)
                        }} />
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-center justify-center flex-wrap gap-1">
                            <span>©</span>
                            <span>
                              {settings.copyright_year_start}
                              {settings.copyright_year_end === 'current' && (
                                <span> - {new Date().getFullYear()}</span>
                              )}
                              {settings.copyright_year_end === 'forever' && (
                                <span> - 至今</span>
                              )}
                              {settings.copyright_year_end !== 'current' && settings.copyright_year_end !== 'forever' && (
                                <span> - {settings.copyright_year_end}</span>
                              )}
                            </span>
                            {settings.site_url ? (
                              <a
                                href={settings.site_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-foreground transition-colors font-medium"
                              >
                                {settings.site_name || '蚂蚁AI导航'}
                              </a>
                            ) : (
                              <span className="font-medium">{settings.site_name || '蚂蚁AI导航'}</span>
                            )}
                            {settings.copyright_company_name && (
                              <span>· {settings.copyright_company_name}</span>
                            )}
                            <span>All rights reserved.</span>
                          </div>
                          {settings.copyright_company_email && (
                            <a
                              href={`mailto:${settings.copyright_company_email}`}
                              className="hover:text-foreground transition-colors"
                            >
                              {settings.copyright_company_email}
                            </a>
                          )}
                        </div>
                      )}

                      {/* 备案信息 */}
                      {(settings.copyright_icp || settings.copyright_police) && (
                        <div className="flex justify-center gap-4 flex-wrap">
                          {settings.copyright_icp && (
                            <a
                              href={settings.copyright_icp_url || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-foreground transition-colors"
                            >
                              {settings.copyright_icp}
                            </a>
                          )}
                          {settings.copyright_police && (
                            <a
                              href={settings.copyright_police_url || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-foreground transition-colors"
                            >
                              {settings.copyright_police}
                            </a>
                          )}
                        </div>
                      )}

                      {/* 附加信息 */}
                      {settings.copyright_additional && (
                        <div className="prose prose-sm max-w-none mx-auto" dangerouslySetInnerHTML={{ 
                          __html: replaceCopyrightPlaceholders(settings.copyright_additional)
                        }} />
                      )}
                    </>
                  ) : (
                    <div className="text-center text-sm text-muted-foreground">
                      版权信息已禁用
                    </div>
                  )}
                </div>
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
