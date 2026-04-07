import Link from 'next/link'
import { headers } from 'next/headers'
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

async function getCopyrightSettings() {
  try {
    const client = getSupabaseClient()
    const { data } = await client
      .from('seo_settings')
      .select('*')
      .single()
    return data || null
  } catch {
    return null
  }
}

function formatCopyrightYear(yearStart: number, yearEnd: string): string {
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

function replaceCopyrightPlaceholders(
  text: string,
  siteName: string,
  siteUrl?: string,
  yearStart: number,
  yearEnd: string,
  companyName?: string,
  companyEmail?: string
): string {
  const currentYear = new Date().getFullYear()
  const yearRange = formatCopyrightYear(yearStart, yearEnd)

  let result = text

  // 智能年份范围判断
  // 如果开始年份 >= 今年，年份范围只显示今年
  let smartYearRange: string
  if (yearStart >= currentYear) {
    smartYearRange = currentYear.toString()
  } else {
    smartYearRange = yearRange
  }

  // 年份相关占位符
  result = result.replace(/\[年份\]/g, yearStart.toString())
  result = result.replace(/\[year\]/gi, yearStart.toString())

  result = result.replace(/\[当前年份\]/g, currentYear.toString())
  result = result.replace(/\[current_year\]/gi, currentYear.toString())

  // 年份范围占位符（智能判断）
  result = result.replace(/\[年份范围\]/g, smartYearRange)
  result = result.replace(/\[year_range\]/gi, smartYearRange)

  // 智能网站名占位符：如果有URL，自动添加a标签
  let siteNameHtml: string
  if (siteUrl) {
    siteNameHtml = `<a href="${siteUrl}" target="_blank" rel="noopener noreferrer" class="hover:text-foreground transition-colors font-medium">${siteName}</a>`
  } else {
    siteNameHtml = `<span class="font-medium">${siteName}</span>`
  }
  result = result.replace(/\[网站名\]/g, siteNameHtml)
  result = result.replace(/\[site_name\]/gi, siteNameHtml)

  // 公司名称占位符
  if (companyName) {
    result = result.replace(/\[公司名\]/g, companyName)
    result = result.replace(/\[company_name\]/gi, companyName)
  }

  // 联系邮箱占位符：自动添加mailto链接
  if (companyEmail) {
    const emailHtml = `<a href="mailto:${companyEmail}" class="hover:text-foreground transition-colors">${companyEmail}</a>`
    result = result.replace(/\[联系邮箱\]/g, emailHtml)
    result = result.replace(/\[email\]/gi, emailHtml)
  }

  return result
}

export async function Footer({ showLinks }: { showLinks?: boolean }) {
  const friendLinks = await getFriendLinks()
  const copyrightSettings = await getCopyrightSettings()

  const copyrightEnabled = copyrightSettings?.copyright_enabled !== false
  const siteName = copyrightSettings?.site_name || '蚂蚁AI导航'
  const siteUrl = copyrightSettings?.site_url
  const copyrightText = copyrightSettings?.copyright_text
  const copyrightYearStart = copyrightSettings?.copyright_year_start || 2024
  const copyrightYearEnd = copyrightSettings?.copyright_year_end || 'current'
  const companyName = copyrightSettings?.copyright_company_name
  const companyEmail = copyrightSettings?.copyright_company_email
  const icp = copyrightSettings?.copyright_icp
  const icpUrl = copyrightSettings?.copyright_icp_url
  const police = copyrightSettings?.copyright_police
  const policeUrl = copyrightSettings?.copyright_police_url
  const additional = copyrightSettings?.copyright_additional

  const yearDisplay = formatCopyrightYear(copyrightYearStart, copyrightYearEnd)

  // 如果没有传递 showLinks 参数，从 header 中获取 pathname 来判断
  let shouldShowLinks = showLinks
  if (showLinks === undefined) {
    try {
      const headersList = await headers()
      const pathname = headersList.get('x-pathname') || ''
      shouldShowLinks = !pathname.startsWith('/blog')
    } catch {
      shouldShowLinks = true
    }
  }

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {shouldShowLinks && (
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
                  {siteName}
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
        )}

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

        {/* 版权信息 */}
        {copyrightEnabled && (
          <div className="mt-6 pt-6 border-t text-center text-sm text-muted-foreground space-y-2">
            {/* 版权文本（包含年份和站点名称） */}
            {copyrightText ? (
              <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{
                __html: replaceCopyrightPlaceholders(
                  copyrightText,
                  siteName,
                  siteUrl,
                  copyrightYearStart,
                  copyrightYearEnd,
                  companyName,
                  companyEmail
                )
              }} />
            ) : (
              <div className="space-y-1">
                <div className="flex items-center justify-center flex-wrap gap-1">
                  <span>©</span>
                  <span>{yearDisplay}</span>
                  {siteUrl ? (
                    <a
                      href={siteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-foreground transition-colors font-medium"
                    >
                      {siteName}
                    </a>
                  ) : (
                    <span className="font-medium">{siteName}</span>
                  )}
                  {companyName && (
                    <span>· {companyName}</span>
                  )}
                  <span>All rights reserved.</span>
                </div>
                {companyEmail && (
                  <a
                    href={`mailto:${companyEmail}`}
                    className="hover:text-foreground transition-colors"
                  >
                    {companyEmail}
                  </a>
                )}
              </div>
            )}

            {/* 备案信息 */}
            {(icp || police) && (
              <div className="flex justify-center gap-4 flex-wrap">
                {icp && (
                  <a
                    href={icpUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors"
                  >
                    {icp}
                  </a>
                )}
                {police && (
                  <a
                    href={policeUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors"
                  >
                    {police}
                  </a>
                )}
              </div>
            )}

            {/* 附加信息 */}
            {additional && (
              <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{
                __html: replaceCopyrightPlaceholders(
                  additional,
                  siteName,
                  siteUrl,
                  copyrightYearStart,
                  copyrightYearEnd,
                  companyName,
                  companyEmail
                )
              }} />
            )}
          </div>
        )}
      </div>
    </footer>
  )
}
