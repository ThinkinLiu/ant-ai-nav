import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Flame, Eye, Heart, ArrowLeft, Loader2 } from 'lucide-react'
import { HotToolsList } from './HotToolsList'

export const metadata = {
  title: '国内火爆AI工具 - 蚂蚁AI导航',
  description: '精选国内最受欢迎的AI工具，包括大模型对话、AI绘画、AI写作、AI编程等多个领域的热门产品。',
}

export default function HotChinaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="py-12 bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 dark:from-red-950/20 dark:via-orange-950/20 dark:to-yellow-950/20">
        <div className="container mx-auto px-4">
          <Button variant="ghost" size="sm" className="mb-4 gap-1" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              返回首页
            </Link>
          </Button>

          <div className="flex items-center gap-3 mb-4">
            <Flame className="h-8 w-8 text-red-500" />
            <h1 className="text-3xl font-bold">国内火爆AI工具</h1>
            <Badge variant="destructive" className="ml-2 text-sm">HOT</Badge>
          </div>
          
          <p className="text-muted-foreground max-w-2xl">
            精选国内最受欢迎的AI工具，包括大模型对话、AI绘画、AI写作、AI编程等多个领域的热门产品。
          </p>

          <div className="mt-6 flex gap-3">
            <Button variant="default" className="bg-red-500 hover:bg-red-600">
              国内火爆
            </Button>
            <Button variant="outline" asChild>
              <Link href="/hot-global">国外火爆</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* 工具列表 */}
      <div className="container mx-auto px-4 py-8">
        <HotToolsList type="domestic" />
      </div>
    </div>
  )
}
