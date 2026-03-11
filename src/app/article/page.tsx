'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, Check, Download } from 'lucide-react'
import Image from 'next/image'

const articleContent = `# 蚂蚁AI导航：发现全球最优秀的AI工具，让智能触手可及

> **"在AI时代，工具的选择决定了效率的上限。"**

---

## 前言：当AI成为新生产力

2026年，人工智能不再是遥不可及的概念，而是已经深入到我们工作的方方面面。从写作、绘画到编程、视频制作，AI工具正在重塑各行各业的工作方式。

然而，面对海量的AI工具，如何找到最适合自己的那一款？国内外的优秀工具分散在各处，信息不对称让选择变得困难。**蚂蚁AI导航**应运而生——一个汇聚全球优质AI工具的专业导航平台。

![首页展示](/assets/home.png)

---

## 产品介绍：三端架构，一站式AI工具门户

蚂蚁AI导航采用**用户端、发布者端、管理端**三端分离架构，为不同角色的用户提供精准服务。

### 🏠 用户端：发现与探索

#### 1. 精选分类，一目了然

平台将AI工具细分为**8大核心分类**：

| 分类 | 描述 | 代表工具 |
|------|------|----------|
| 🤖 AI对话 | 智能对话助手，人性化交互 | ChatGPT、DeepSeek、Claude |
| ✍️ AI写作 | 快速生成高质量文本内容 | Jasper、秘塔写作猫、Grammarly |
| 🎨 AI绘画 | 文字描述创建精美图像 | Midjourney、DALL-E、通义万相 |
| 💻 AI编程 | 辅助编程，提升开发效率 | GitHub Copilot、Cursor、通义灵码 |
| 🎬 AI视频 | 智能视频生成与编辑 | Runway、Pika、即梦AI |
| 🎵 AI音频 | 语音合成与音乐创作 | ElevenLabs、Suno、魔音工坊 |
| 💼 AI办公 | 办公助手，提升效率 | Notion AI、飞书AI、Gamma |
| 📚 AI学习 | 智能教育辅助 | Khanmigo、知网研学 |

![分类浏览](/assets/categories.png)

#### 2. 国内外工具分栏展示

首页独特设计了**国内火爆AI工具**与**国外火爆AI工具**双栏展示：

- 🔥 **国内火爆**：DeepSeek、Kimi、通义千问、文心一言、讯飞星火、豆包等国产AI神器
- 🌍 **国外火爆**：ChatGPT、Claude、Gemini、Midjourney、GitHub Copilot等国际顶尖工具

![国内外工具分栏](/assets/area.png)

#### 3. 智能搜索与筛选

支持多维度筛选：关键词搜索、分类筛选、排序方式（发布时间、浏览量、收藏量、评论量）

![搜索筛选](/assets/search.png)

#### 4. 工具详情页

每个工具都有专属详情页，包含工具介绍、官网链接、用户评分、评论互动、一键收藏功能。

![工具详情页](/assets/details.png)

#### 5. 个人中心

注册用户可享受个性化服务：我的收藏、个人资料、发布者申请。

![个人中心](/assets/person.png)

---

### 📝 发布者端：分享与成长

成为发布者，你可以：发布工具、管理工具、编辑更新。

![发布者中心](/assets/publish.png)

数据面板清晰展示发布统计。

![发布者数据](/assets/publishdata.png)

---

### 👑 管理端：高效运营

管理员拥有完整的后台管理能力：数据概览、工具审核、用户管理、评论管理。

![管理后台](/assets/manage.png)

---

## 技术架构

- **Next.js 16 (App Router)** - 服务端渲染
- **React 19** - 并发渲染
- **TypeScript 5** - 全栈类型安全
- **Tailwind CSS 4** - 原子化CSS
- **shadcn/ui** - 精美组件库
- **Supabase (PostgreSQL)** - 数据库 + 认证

---

## 数据规模

平台已收录 **1700+ 真实AI工具**，覆盖国内外混合、分类均衡、持续更新。

---

> **蚂蚁AI导航** - 发现最好的AI工具，释放无限创造力`

export default function ArticlePage() {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(articleContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([articleContent], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '蚂蚁AI导航介绍.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">🌐 网站介绍</h1>
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
        <CardContent className="p-8">
          <article className="prose prose-slate dark:prose-invert max-w-none">
            <h1 className="text-3xl font-bold mb-4">蚂蚁AI导航：发现全球最优秀的AI工具，让智能触手可及</h1>
            
            <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-6">
              "在AI时代，工具的选择决定了效率的上限。"
            </blockquote>

            <hr className="my-8" />

            <h2 className="text-2xl font-bold mt-8 mb-4">前言：当AI成为新生产力</h2>
            <p className="text-muted-foreground leading-relaxed">
              2026年，人工智能不再是遥不可及的概念，而是已经深入到我们工作的方方面面。从写作、绘画到编程、视频制作，AI工具正在重塑各行各业的工作方式。
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              然而，面对海量的AI工具，如何找到最适合自己的那一款？国内外的优秀工具分散在各处，信息不对称让选择变得困难。<strong>蚂蚁AI导航</strong>应运而生——一个汇聚全球优质AI工具的专业导航平台。
            </p>

            {/* 首页截图 */}
            <div className="my-8 rounded-lg overflow-hidden border">
              <Image 
                src="/assets/home.png" 
                alt="首页展示" 
                width={800} 
                height={400}
                className="w-full h-auto"
              />
            </div>

            <hr className="my-8" />

            <h2 className="text-2xl font-bold mt-8 mb-4">产品介绍：三端架构，一站式AI工具门户</h2>
            <p className="text-muted-foreground leading-relaxed">
              蚂蚁AI导航采用<strong>用户端、发布者端、管理端</strong>三端分离架构，为不同角色的用户提供精准服务。
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">🏠 用户端：发现与探索</h3>
            
            <h4 className="text-lg font-medium mt-4 mb-2">1. 精选分类，一目了然</h4>
            <p className="text-muted-foreground mb-4">平台将AI工具细分为<strong>8大核心分类</strong>：</p>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border rounded-lg overflow-hidden">
                <thead className="bg-muted">
                  <tr>
                    <th className="border border-border p-3 text-left">分类</th>
                    <th className="border border-border p-3 text-left">描述</th>
                    <th className="border border-border p-3 text-left">代表工具</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-border p-3">🤖 AI对话</td><td className="border border-border p-3">智能对话助手</td><td className="border border-border p-3">ChatGPT、DeepSeek、Claude</td></tr>
                  <tr><td className="border border-border p-3">✍️ AI写作</td><td className="border border-border p-3">高质量文本生成</td><td className="border border-border p-3">Jasper、秘塔写作猫</td></tr>
                  <tr><td className="border border-border p-3">🎨 AI绘画</td><td className="border border-border p-3">文字生成图像</td><td className="border border-border p-3">Midjourney、DALL-E</td></tr>
                  <tr><td className="border border-border p-3">💻 AI编程</td><td className="border border-border p-3">辅助编程开发</td><td className="border border-border p-3">GitHub Copilot、Cursor</td></tr>
                  <tr><td className="border border-border p-3">🎬 AI视频</td><td className="border border-border p-3">视频生成编辑</td><td className="border border-border p-3">Runway、Pika、即梦AI</td></tr>
                  <tr><td className="border border-border p-3">🎵 AI音频</td><td className="border border-border p-3">语音音乐创作</td><td className="border border-border p-3">ElevenLabs、Suno</td></tr>
                  <tr><td className="border border-border p-3">💼 AI办公</td><td className="border border-border p-3">办公效率提升</td><td className="border border-border p-3">Notion AI、飞书AI</td></tr>
                  <tr><td className="border border-border p-3">📚 AI学习</td><td className="border border-border p-3">智能教育辅助</td><td className="border border-border p-3">Khanmigo、知网研学</td></tr>
                </tbody>
              </table>
            </div>

            {/* 分类截图 */}
            <div className="my-8 rounded-lg overflow-hidden border">
              <Image 
                src="/assets/categories.png" 
                alt="分类浏览" 
                width={800} 
                height={300}
                className="w-full h-auto"
              />
            </div>

            <h4 className="text-lg font-medium mt-6 mb-2">2. 国内外工具分栏展示</h4>
            <p className="text-muted-foreground">首页独特设计了<strong>国内火爆AI工具</strong>与<strong>国外火爆AI工具</strong>双栏展示：</p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>🔥 <strong>国内火爆</strong>：DeepSeek、Kimi、通义千问、文心一言、讯飞星火、豆包等</li>
              <li>🌍 <strong>国外火爆</strong>：ChatGPT、Claude、Gemini、Midjourney、GitHub Copilot等</li>
            </ul>

            {/* 国内外分栏截图 */}
            <div className="my-8 rounded-lg overflow-hidden border">
              <Image 
                src="/assets/area.png" 
                alt="国内外工具分栏" 
                width={800} 
                height={300}
                className="w-full h-auto"
              />
            </div>

            <h4 className="text-lg font-medium mt-6 mb-2">3. 智能搜索与筛选</h4>
            <p className="text-muted-foreground">支持多维度筛选：关键词搜索、分类筛选、排序方式（发布时间、浏览量、收藏量、评论量）</p>

            {/* 搜索截图 */}
            <div className="my-8 rounded-lg overflow-hidden border">
              <Image 
                src="/assets/search.png" 
                alt="搜索筛选" 
                width={800} 
                height={200}
                className="w-full h-auto"
              />
            </div>

            <h4 className="text-lg font-medium mt-6 mb-2">4. 工具详情页</h4>
            <p className="text-muted-foreground">每个工具都有专属详情页，包含工具介绍、官网链接、用户评分、评论互动、一键收藏功能。</p>

            {/* 详情页截图 */}
            <div className="my-8 rounded-lg overflow-hidden border">
              <Image 
                src="/assets/details.png" 
                alt="工具详情页" 
                width={800} 
                height={400}
                className="w-full h-auto"
              />
            </div>

            <h4 className="text-lg font-medium mt-6 mb-2">5. 个人中心</h4>
            <p className="text-muted-foreground">注册用户可享受个性化服务：我的收藏、个人资料、发布者申请。</p>

            {/* 个人中心截图 */}
            <div className="my-8 rounded-lg overflow-hidden border">
              <Image 
                src="/assets/person.png" 
                alt="个人中心" 
                width={800} 
                height={400}
                className="w-full h-auto"
              />
            </div>

            <h3 className="text-xl font-semibold mt-8 mb-3">📝 发布者端：分享与成长</h3>
            <p className="text-muted-foreground">成为发布者，你可以：发布工具、管理工具、编辑更新。数据面板清晰展示发布统计。</p>

            {/* 发布者中心截图 */}
            <div className="my-8 rounded-lg overflow-hidden border">
              <Image 
                src="/assets/publish.png" 
                alt="发布者中心" 
                width={800} 
                height={300}
                className="w-full h-auto"
              />
            </div>

            {/* 发布者数据截图 */}
            <div className="my-8 rounded-lg overflow-hidden border">
              <Image 
                src="/assets/publishdata.png" 
                alt="发布者数据" 
                width={800} 
                height={200}
                className="w-full h-auto"
              />
            </div>

            <h3 className="text-xl font-semibold mt-8 mb-3">👑 管理端：高效运营</h3>
            <p className="text-muted-foreground">管理员拥有完整的后台管理能力：数据概览、工具审核、用户管理、评论管理。</p>

            {/* 管理后台截图 */}
            <div className="my-8 rounded-lg overflow-hidden border">
              <Image 
                src="/assets/manage.png" 
                alt="管理后台" 
                width={800} 
                height={300}
                className="w-full h-auto"
              />
            </div>

            <hr className="my-8" />

            <h2 className="text-2xl font-bold mt-8 mb-4">技术架构：现代、高效、可扩展</h2>

            <h3 className="text-xl font-semibold mt-6 mb-3">前端技术</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li><strong>Next.js 16 (App Router)</strong> - 服务端渲染，首屏加载速度提升40%</li>
              <li><strong>React 19</strong> - 并发渲染，流畅用户体验</li>
              <li><strong>TypeScript 5</strong> - 全栈类型安全</li>
              <li><strong>Tailwind CSS 4</strong> - 原子化CSS</li>
              <li><strong>shadcn/ui</strong> - 精美组件库</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">后端技术</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li><strong>Next.js API Routes</strong> - Serverless Functions</li>
              <li><strong>Supabase (PostgreSQL)</strong> - 数据库 + 认证 + 行级安全策略</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">数据模型</h3>
            <p className="text-muted-foreground">核心数据表：users、categories、ai_tools、comments、favorites、tags</p>

            <hr className="my-8" />

            <h2 className="text-2xl font-bold mt-8 mb-4">数据规模</h2>
            <p className="text-muted-foreground">平台已收录 <strong>1700+ 真实AI工具</strong>，覆盖国内外混合、分类均衡、持续更新。</p>

            <hr className="my-8" />

            <h2 className="text-2xl font-bold mt-8 mb-4">结语：让AI工具触手可及</h2>
            <p className="text-muted-foreground leading-relaxed">
              蚂蚁AI导航不仅是一个工具导航网站，更是AI时代的效率加速器。无论你是开发者、内容创作者、设计师还是职场人士，都能在这里找到最适合的AI工具。
            </p>
            <p className="font-semibold mt-4"><strong>立即访问，开启你的AI效率之旅！</strong></p>

            <hr className="my-8" />

            <h2 className="text-2xl font-bold mt-8 mb-4">技术栈清单</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border rounded-lg overflow-hidden">
                <thead className="bg-muted">
                  <tr>
                    <th className="border border-border p-3 text-left">类别</th>
                    <th className="border border-border p-3 text-left">技术</th>
                    <th className="border border-border p-3 text-left">版本</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-border p-3">框架</td><td className="border border-border p-3">Next.js</td><td className="border border-border p-3">16.x</td></tr>
                  <tr><td className="border border-border p-3">前端</td><td className="border border-border p-3">React</td><td className="border border-border p-3">19.x</td></tr>
                  <tr><td className="border border-border p-3">语言</td><td className="border border-border p-3">TypeScript</td><td className="border border-border p-3">5.x</td></tr>
                  <tr><td className="border border-border p-3">样式</td><td className="border border-border p-3">Tailwind CSS</td><td className="border border-border p-3">4.x</td></tr>
                  <tr><td className="border border-border p-3">组件</td><td className="border border-border p-3">shadcn/ui</td><td className="border border-border p-3">latest</td></tr>
                  <tr><td className="border border-border p-3">数据库</td><td className="border border-border p-3">Supabase</td><td className="border border-border p-3">-</td></tr>
                  <tr><td className="border border-border p-3">图标</td><td className="border border-border p-3">Lucide Icons</td><td className="border border-border p-3">latest</td></tr>
                </tbody>
              </table>
            </div>

            <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-8">
              <strong>蚂蚁AI导航</strong> - 发现最好的AI工具，释放无限创造力
            </blockquote>
          </article>
        </CardContent>
      </Card>
    </div>
  )
}
