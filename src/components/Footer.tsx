import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <span className="text-lg font-bold text-white">蚂</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                蚂蚁AI导航
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              蚂蚁AI导航是一个专注于AI工具的资源导航平台，帮助用户发现和使用最优秀的AI产品。我们致力于为用户提供最新、最全、最好用的AI工具信息。
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">快速链接</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-foreground transition-colors">首页</Link></li>
              <li><Link href="/categories" className="hover:text-foreground transition-colors">分类浏览</Link></li>
              <li><Link href="/?isFeatured=true" className="hover:text-foreground transition-colors">精选推荐</Link></li>
              <li><Link href="/publisher" className="hover:text-foreground transition-colors">发布工具</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">支持</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/article" className="hover:text-foreground transition-colors">关于我们</Link></li>
              <li><Link href="/contact" className="hover:text-foreground transition-colors">联系我们</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground transition-colors">隐私政策</Link></li>
              <li><Link href="/terms" className="hover:text-foreground transition-colors">使用条款</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} 蚂蚁AI导航. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
