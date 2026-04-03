import Link from 'next/link'
import { getSupabaseClient } from '@/storage/database/supabase-client'

async function getFriendLinks() {
  try {
    const client = getSupabaseClient()
    const { data } = await client
      .from('friend_links')
      .select('id, name, url')
      .eq('status', 'approved')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })
    return data || []
  } catch {
    return []
  }
}

export async function Footer() {
  const friendLinks = await getFriendLinks()

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <img 
                src="/logo.png" 
                alt="蚂蚁AI导航" 
                className="h-8 w-8 rounded-lg object-contain"
              />
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
              <li><Link href="/categories" className="hover:text-foreground transition-colors">AI分类</Link></li>
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

        {/* 友情链接 */}
        <div className="mt-8 pt-6 border-t">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">友情链接：</span>
            {friendLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                {link.name}
              </a>
            ))}
            <Link 
              href="/link-submit"
              className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
            >
              <span className="text-xs">+</span>
              申请收录
            </Link>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            关注微信公众号「IT老五」获取更多AI工具资讯和教程
          </p>
        </div>

        <div className="mt-6 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} 蚂蚁AI导航. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
