import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, ArrowLeft } from 'lucide-react'
import { HotToolsList } from './HotToolsList'

export const metadata = {
  title: '国外火爆AI工具 - 蚂蚁AI导航',
  description: '汇集全球顶尖的AI工具，涵盖对话、绘画、视频、音频等多个领域的国际知名产品。',
}

export default function HotGlobalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="py-12 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20">
        <div className="container mx-auto px-4">
          <Button variant="ghost" size="sm" className="mb-4 gap-1" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              返回首页
            </Link>
          </Button>

          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="h-8 w-8 text-blue-500" />
            <h1 className="text-3xl font-bold">国外火爆AI工具</h1>
            <Badge className="ml-2 text-sm bg-blue-500 hover:bg-blue-600">GLOBAL</Badge>
          </div>
          
          <p className="text-muted-foreground max-w-2xl">
            汇集全球顶尖的AI工具，涵盖对话、绘画、视频、音频等多个领域的国际知名产品。
          </p>

          <div className="mt-6 flex gap-3">
            <Button variant="outline" asChild>
              <Link href="/hot-china">国内火爆</Link>
            </Button>
            <Button variant="default" className="bg-blue-500 hover:bg-blue-600">
              国外火爆
            </Button>
          </div>
        </div>
      </div>

      {/* 工具列表 */}
      <div className="container mx-auto px-4 py-8">
        <HotToolsList type="foreign" />
      </div>
    </div>
  )
}
