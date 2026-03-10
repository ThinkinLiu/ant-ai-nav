'use client'

import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, Check, Download } from 'lucide-react'

export default function ArticlePage() {
  const [content, setContent] = useState('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/article.md')
      .then(res => res.text())
      .then(text => {
        setContent(text)
        setLoading(false)
      })
  }, [])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '蚂蚁AI导航软文.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">📝 软文预览</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            {copied ? '已复制' : '复制内容'}
          </Button>
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            下载MD
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="prose prose-slate dark:prose-invert max-w-none p-8">
          <ReactMarkdown>{content}</ReactMarkdown>
        </CardContent>
      </Card>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">📸 需要配合以下截图使用：</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• <strong>首页展示</strong>：展示Hero区域和分类导航</li>
          <li>• <strong>分类浏览</strong>：展示8大分类卡片</li>
          <li>• <strong>国内外工具分栏</strong>：展示国内/国外火爆工具区域</li>
          <li>• <strong>搜索筛选</strong>：展示搜索框和筛选功能</li>
          <li>• <strong>工具详情页</strong>：展示某个工具的完整详情</li>
          <li>• <strong>个人中心</strong>：展示用户个人中心页面</li>
          <li>• <strong>发布者中心</strong>：展示发布者数据面板</li>
          <li>• <strong>发布者数据</strong>：展示工具列表和统计</li>
          <li>• <strong>管理后台</strong>：展示管理员数据概览</li>
        </ul>
      </div>
    </div>
  )
}
