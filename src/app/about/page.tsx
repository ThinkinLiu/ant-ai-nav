import { ArrowRight, Sparkles, Zap, Shield, Globe, Code, Users, Star } from 'lucide-react'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            <span>发现全球最优秀的AI工具</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            蚂蚁AI导航
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground mb-4">
            让智能触手可及
          </p>
          <blockquote className="text-lg text-muted-foreground italic mb-8 max-w-2xl mx-auto">
            "在AI时代，工具的选择决定了效率的上限。"
          </blockquote>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/">
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition">
                开始探索
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="#features">
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition">
                了解更多
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* 前言 */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-2xl p-8 shadow-lg border">
            <h2 className="text-3xl font-bold mb-6">当AI成为新生产力</h2>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed mb-4">
                2026年，人工智能不再是遥不可及的概念，而是已经深入到我们工作的方方面面。从写作、绘画到编程、视频制作，AI工具正在重塑各行各业的工作方式。
              </p>
              <p className="text-muted-foreground leading-relaxed">
                然而，面对海量的AI工具，如何找到最适合自己的那一款？国内外的优秀工具分散在各处，信息不对称让选择变得困难。<span className="text-primary font-semibold">蚂蚁AI导航</span>应运而生——一个汇聚全球优质AI工具的专业导航平台。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 核心功能 */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">核心功能</h2>
            <p className="text-muted-foreground text-lg">一站式AI工具发现平台</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Globe className="w-8 h-8" />}
              title="8大分类"
              description="AI对话、写作、绘画、编程、视频、音频、办公、学习"
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8" />}
              title="智能搜索"
              description="关键词搜索、分类筛选、标签筛选、多种排序方式"
            />
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="用户互动"
              description="评分评论、收藏功能、相关推荐、热门榜单"
            />
            <FeatureCard
              icon={<Star className="w-8 h-8" />}
              title="内容丰富"
              description="AI资讯、名人堂、大事纪，持续更新"
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="安全可靠"
              description="邮箱验证、会话管理、数据加密"
            />
            <FeatureCard
              icon={<Code className="w-8 h-8" />}
              title="开源免费"
              description="MIT协议，欢迎学习和二次开发"
            />
          </div>
        </div>
      </section>

      {/* 工具分类 */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">工具分类</h2>
            <p className="text-muted-foreground text-lg">覆盖AI领域的全部分类</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <CategoryCard
              emoji="🤖"
              name="AI对话"
              examples="ChatGPT, DeepSeek, Claude"
            />
            <CategoryCard
              emoji="✍️"
              name="AI写作"
              examples="Jasper, 秘塔写作猫, Grammarly"
            />
            <CategoryCard
              emoji="🎨"
              name="AI绘画"
              examples="Midjourney, DALL-E, 通义万相"
            />
            <CategoryCard
              emoji="💻"
              name="AI编程"
              examples="GitHub Copilot, Cursor, 通义灵码"
            />
            <CategoryCard
              emoji="🎬"
              name="AI视频"
              examples="Runway, Pika, 即梦AI"
            />
            <CategoryCard
              emoji="🎵"
              name="AI音频"
              examples="ElevenLabs, Suno, 魔音工坊"
            />
            <CategoryCard
              emoji="💼"
              name="AI办公"
              examples="Notion AI, 飞书AI, Gamma"
            />
            <CategoryCard
              emoji="📚"
              name="AI学习"
              examples="Khanmigo, 知网研学"
            />
          </div>
        </div>
      </section>

      {/* 数据统计 */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-primary/10 to-purple-600/10 rounded-2xl p-8 md:p-12">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
              <StatItem number="2,000+" label="AI工具" />
              <StatItem number="200+" label="AI资讯" />
              <StatItem number="150+" label="名人堂" />
              <StatItem number="150+" label="大事纪" />
              <StatItem number="8" label="分类" />
              <StatItem number="100+" label="用户" />
            </div>
          </div>
        </div>
      </section>

      {/* 技术栈 */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">技术栈</h2>
            <p className="text-muted-foreground text-lg">现代化的技术架构</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TechCard
              title="前端框架"
              items={['Next.js 16', 'React 19', 'TypeScript 5']}
            />
            <TechCard
              title="样式方案"
              items={['Tailwind CSS 4', 'shadcn/ui', 'Lucide Icons']}
            />
            <TechCard
              title="数据库"
              items={['Supabase', 'PostgreSQL', 'RLS 安全策略']}
            />
            <TechCard
              title="AI 能力"
              items={['Coze SDK', 'Web Search', 'LLM', 'Embedding']}
            />
            <TechCard
              title="富文本编辑"
              items={['TipTap', '图片粘贴上传', '网页内容导入']}
            />
            <TechCard
              title="其他服务"
              items={['Nodemailer', 'S3 存储', 'JWT 认证']}
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            开始探索AI工具世界
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            加入我们，发现更多AI工具，提升工作效率
          </p>
          <Link href="/">
            <button className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg font-medium text-lg hover:bg-primary/90 transition">
              立即开始
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t">
        <div className="max-w-7xl mx-auto text-center text-muted-foreground">
          <p className="mb-2">
            Made with ❤️ by Ant AI Nav Team
          </p>
          <p className="text-sm">
            更新时间: 2026-04-01
          </p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-card rounded-xl p-6 shadow-md border hover:shadow-lg transition">
      <div className="text-primary mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  )
}

function CategoryCard({ emoji, name, examples }: { emoji: string; name: string; examples: string }) {
  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border hover:shadow-md transition text-center">
      <div className="text-4xl mb-3">{emoji}</div>
      <h3 className="font-semibold mb-2">{name}</h3>
      <p className="text-sm text-muted-foreground">{examples}</p>
    </div>
  )
}

function StatItem({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">{number}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  )
}

function TechCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-card rounded-xl p-6 shadow-md border">
      <h3 className="font-semibold mb-4 text-lg">{title}</h3>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
