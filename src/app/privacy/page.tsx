import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Eye, Lock, Database, Cookie, Bell, Users, RefreshCw } from 'lucide-react'

export const metadata: Metadata = {
  title: '隐私政策 - 蚂蚁AI导航',
  description: '蚂蚁AI导航隐私政策，了解我们如何收集、使用和保护您的个人信息。',
}

const sections = [
  {
    icon: Shield,
    title: '1. 信息收集',
    content: `我们收集的信息包括：

• **账户信息**：当您注册账户时，我们会收集您的用户名、邮箱地址等基本信息。
• **使用数据**：我们会收集您访问和使用网站的数据，包括浏览记录、搜索关键词、点击行为等。
• **设备信息**：包括您的IP地址、浏览器类型、操作系统、设备标识符等技术信息。
• **Cookie数据**：我们使用Cookie和类似技术来改善您的浏览体验。
• **用户生成内容**：包括您发布的评论、工具评价、收藏列表等内容。

我们仅在您主动提供或使用服务时收集上述信息。`
  },
  {
    icon: Eye,
    title: '2. 信息使用',
    content: `我们使用收集的信息用于以下目的：

• **提供服务**：处理您的请求，提供个性化的工具推荐和浏览体验。
• **改善服务**：分析用户行为，优化网站功能和内容展示。
• **安全保障**：检测和防止欺诈、滥用行为，保护平台安全。
• **用户沟通**：发送服务通知、更新提醒、安全警示等重要信息。
• **数据分析**：进行统计分析，了解用户需求和行业趋势。

我们承诺不会将您的个人信息用于未经授权的用途。`
  },
  {
    icon: Database,
    title: '3. 信息存储与保护',
    content: `我们采取多种安全措施保护您的个人信息：

• **数据加密**：使用SSL/TLS加密传输敏感数据，数据库中的敏感信息采用加密存储。
• **访问控制**：严格限制员工对用户数据的访问权限，仅授权人员可以访问必要数据。
• **安全审计**：定期进行安全审计和漏洞扫描，及时修复安全隐患。
• **数据备份**：建立完善的数据备份机制，防止数据丢失。
• **服务器安全**：使用可靠的服务器和云服务，确保数据存储安全。

我们的服务器位于安全的数据中心，符合相关数据保护法规要求。`
  },
  {
    icon: Users,
    title: '4. 信息共享',
    content: `我们不会出售您的个人信息。在以下情况下，我们可能会共享您的信息：

• **服务提供商**：与帮助我们运营网站的第三方服务提供商共享必要信息（如云服务、分析服务）。
• **法律要求**：当法律法规要求或政府机构依法要求时，我们可能需要披露相关信息。
• **业务转让**：如发生合并、收购或资产出售，您的信息可能作为资产的一部分被转让。
• **用户同意**：在获得您明确同意的情况下，我们可能与其他方共享您的信息。

我们要求所有第三方服务提供商遵守严格的隐私保护标准。`
  },
  {
    icon: Cookie,
    title: '5. Cookie政策',
    content: `我们使用Cookie和类似技术来：

• **必要Cookie**：确保网站正常运行所必需的Cookie，如登录状态、安全设置等。
• **功能Cookie**：记住您的偏好设置，提供个性化体验。
• **分析Cookie**：了解用户如何使用网站，帮助我们改进服务。
• **广告Cookie**：用于展示相关的广告内容。

您可以通过浏览器设置管理或删除Cookie，但这可能影响部分网站功能的使用体验。`
  },
  {
    icon: Lock,
    title: '6. 用户权利',
    content: `作为用户，您享有以下权利：

• **访问权**：您有权访问我们持有的您的个人信息。
• **更正权**：您可以要求更正不准确或不完整的个人信息。
• **删除权**：在特定情况下，您可以要求删除您的个人信息。
• **限制处理权**：您可以要求限制对您个人信息的处理。
• **数据携带权**：您可以要求以结构化格式获取您的个人数据。
• **反对权**：您可以反对某些类型的个人信息处理。

如需行使上述权利，请通过本站联系方式与我们取得联系。`
  },
  {
    icon: Bell,
    title: '7. 通知与更新',
    content: `我们可能会不时更新本隐私政策：

• **重大变更**：涉及用户权利的重大变更，我们将通过网站公告、邮件等方式通知您。
• **次要变更**：轻微的调整将在本页面直接更新，不再单独通知。
• **生效日期**：政策更新后，新的隐私政策将立即生效。
• **版本记录**：我们在页面底部标注最后更新日期，建议您定期查阅。

继续使用我们的服务即表示您同意更新后的隐私政策。`
  },
  {
    icon: RefreshCw,
    title: '8. 第三方链接',
    content: `本网站包含指向第三方网站的链接：

• **独立运营**：第三方网站由各自独立的运营商管理，有其独立的隐私政策。
• **不承担责任**：我们不对第三方网站的隐私实践或内容负责。
• **建议查阅**：访问第三方网站前，建议您查阅其隐私政策。
• **工具推荐**：我们推荐的AI工具由第三方提供，使用时请遵守其服务条款。

我们建议您仔细阅读任何您访问的第三方网站的隐私政策。`
  }
]

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-4">隐私政策</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          我们非常重视您的隐私保护。本隐私政策说明了蚂蚁AI导航如何收集、使用、存储和保护您的个人信息。
        </p>
        <p className="text-sm text-muted-foreground mt-4">
          最后更新日期：2026年3月10日
        </p>
      </div>

      {/* Introduction */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <p className="text-muted-foreground">
            欢迎使用蚂蚁AI导航。我们致力于保护您的个人隐私，并确保您在使用我们的服务时能够放心。
            本隐私政策适用于蚂蚁AI导航网站（以下简称"本站"）提供的所有服务。在使用本站服务前，
            请您仔细阅读并理解本隐私政策的全部内容。
          </p>
        </CardContent>
      </Card>

      {/* Sections */}
      <div className="space-y-6">
        {sections.map((section, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                  <section.icon className="h-5 w-5 text-primary" />
                </div>
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                {section.content}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contact Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            9. 联系我们
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-3">
            <p>
              如果您对本隐私政策有任何疑问、意见或建议，请通过以下方式联系我们：
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium mb-1">隐私相关咨询</p>
                <a href="mailto:privacy@mayiai.site" className="text-sm text-primary hover:underline">
                  privacy@mayiai.site
                </a>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium mb-1">数据删除请求</p>
                <a href="mailto:data@mayiai.site" className="text-sm text-primary hover:underline">
                  data@mayiai.site
                </a>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium mb-1">一般问题反馈</p>
                <a href="mailto:support@mayiai.site" className="text-sm text-primary hover:underline">
                  support@mayiai.site
                </a>
              </div>
            </div>
            <p className="mt-4">
              我们将在收到您的请求后30个工作日内予以回复。
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Footer Note */}
      <div className="mt-8 p-6 bg-muted/50 rounded-lg text-center">
        <p className="text-sm text-muted-foreground">
          本隐私政策的解释权归蚂蚁AI导航所有。如有任何争议，我们将依据中华人民共和国相关法律法规进行处理。
        </p>
      </div>
    </div>
  )
}
