import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, CheckCircle, XCircle, AlertTriangle, Scale, Shield, Gavel, RefreshCw, Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: '服务条款 - 蚂蚁AI导航',
  description: '蚂蚁AI导航服务条款，了解使用本平台的相关规定和责任声明。',
}

const sections = [
  {
    icon: CheckCircle,
    title: '1. 服务说明',
    content: `蚂蚁AI导航（以下简称"本站"）是一个AI工具资源导航平台，致力于为用户提供AI工具的发现、评价和交流服务。

**服务范围包括：**
• AI工具信息的收集、整理和展示
• 工具分类浏览和搜索功能
• 用户评价和收藏功能
• 工具发布和审核服务
• 行业资讯和教程内容

**服务性质：**
• 本站仅作为信息展示平台，不直接提供AI工具服务
• 工具的真实性、有效性由工具提供方负责
• 本站保留随时修改、暂停或终止部分或全部服务的权利`
  },
  {
    icon: Scale,
    title: '2. 用户注册与账户',
    content: `**注册要求：**
• 用户需提供真实、准确、完整的注册信息
• 用户应妥善保管账户信息和密码
• 用户年满18周岁或已获得监护人同意

**账户安全：**
• 用户对账户下的所有行为负责
• 发现账户被盗用应立即通知本站
• 禁止出售、转让或出借账户

**账户注销：**
• 用户可申请注销账户
• 注销后相关数据将被删除或匿名化处理
• 注销后无法恢复账户及相关数据`
  },
  {
    icon: CheckCircle,
    title: '3. 用户行为规范',
    content: `**用户承诺在使用本站服务时遵守以下规范：**

**允许的行为：**
• 浏览、搜索和收藏AI工具信息
• 发布真实、客观的工具评价
• 推荐优质的AI工具
• 参与社区讨论和交流
• 举报违规内容和行为

**禁止的行为：**
• 发布虚假、误导性信息
• 恶意刷评、刷量或操纵排名
• 传播违法、有害、侵权内容
• 攻击、骚扰或诽谤其他用户
• 利用平台进行商业推广或营销
• 破坏平台安全或干扰正常运营
• 未经授权爬取或复制平台数据`
  },
  {
    icon: XCircle,
    title: '4. 工具发布规范',
    content: `**发布者责任：**
• 确保发布的工具信息真实、准确
• 拥有发布该工具的合法权利
• 及时更新工具信息，保持准确性
• 对发布内容承担全部法律责任

**审核机制：**
• 所有工具提交后需经过审核
• 审核通过后方可公开展示
• 审核时间一般为1-3个工作日
• 审核结果将通过站内消息或邮件通知

**违规处理：**
• 发现违规工具将立即下架
• 严重违规者将禁止发布工具
• 涉嫌违法的将向有关部门举报`
  },
  {
    icon: Shield,
    title: '5. 知识产权',
    content: `**本站权利：**
• 本站的所有内容（包括但不限于文字、图片、图标、代码、数据）的知识产权归本站所有
• 未经授权，不得复制、修改、传播或用于商业目的

**用户权利：**
• 用户发布的内容（评价、评论等）的著作权归用户所有
• 用户授权本站在全球范围内使用、展示、传播该内容

**侵权处理：**
• 如发现侵权内容，请通过版权投诉渠道联系我们
• 我们将在收到有效通知后及时处理
• 必要时将采取删除、屏蔽等措施`
  },
  {
    icon: AlertTriangle,
    title: '6. 免责声明',
    content: `**重要提示：**

• 本站仅提供AI工具信息展示服务，不对工具本身的功能、质量、安全性做任何保证

• 用户使用第三方AI工具产生的任何损失，本站不承担责任

• 本站不保证服务不会中断，不对因网络状况等原因造成的损失负责

• 用户因违反本条款或法律法规造成的后果，由用户自行承担

• 本站不对用户之间的纠纷承担任何责任

• 因不可抗力导致的服务中断或损失，本站不承担责任`
  },
  {
    icon: Gavel,
    title: '7. 违规处理',
    content: `**对于违反本条款的行为，本站有权采取以下措施：**

• **警告**：对轻微违规行为进行警告提醒
• **内容处理**：删除、屏蔽违规内容
• **功能限制**：限制部分或全部功能的使用
• **账户封禁**：暂时或永久封禁违规账户
• **法律追究**：对严重违规或违法行为，保留追究法律责任的权利

**申诉渠道：**
• 用户对处理结果有异议，可通过申诉渠道提交申诉
• 我们将在收到申诉后5个工作日内复核并回复`
  },
  {
    icon: RefreshCw,
    title: '8. 条款更新',
    content: `**更新机制：**
• 本站有权随时修改本服务条款
• 重大变更将通过站内公告、邮件等方式通知
• 修改后的条款在发布后立即生效

**用户同意：**
• 继续使用本站服务即视为同意修改后的条款
• 如不同意修改后的条款，应停止使用本站服务

**版本记录：**
• 本页面将标注最后更新日期
• 建议用户定期查阅最新条款`
  }
]

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
          <FileText className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-4">服务条款</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          欢迎使用蚂蚁AI导航。在使用本平台服务前，请仔细阅读以下服务条款。
          使用本平台即表示您同意遵守这些条款。
        </p>
        <p className="text-sm text-muted-foreground mt-4">
          最后更新日期：2026年3月10日
        </p>
      </div>

      {/* Important Notice */}
      <Card className="mb-8 border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">重要提示</h3>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                请在使用本平台服务前仔细阅读本服务条款，特别是免除或限制责任的条款。
                如果您不同意本条款的任何内容，请勿使用本平台服务。您的使用行为将被视为对本条款的全部接受。
              </p>
            </div>
          </div>
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
              <Mail className="h-5 w-5 text-primary" />
            </div>
            9. 联系我们
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-3">
            <p>
              如果您对本服务条款有任何疑问，或需要报告违规行为，请通过以下方式联系我们：
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium mb-1">服务咨询</p>
                <a href="mailto:support@itlao5.com" className="text-sm text-primary hover:underline">
                  support@itlao5.com
                </a>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium mb-1">违规举报</p>
                <a href="mailto:report@itlao5.com" className="text-sm text-primary hover:underline">
                  report@itlao5.com
                </a>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium mb-1">版权投诉</p>
                <a href="mailto:copyright@itlao5.com" className="text-sm text-primary hover:underline">
                  copyright@itlao5.com
                </a>
              </div>
            </div>
            <p className="mt-4">
              我们将在收到您的消息后尽快处理并回复。
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Legal Information */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <Gavel className="h-5 w-5 text-primary" />
            </div>
            10. 法律适用与争议解决
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-3">
            <p>• 本条款的订立、执行、解释及争议解决均适用中华人民共和国法律。</p>
            <p>• 如本条款任一条款被认定为无效或不可执行，不影响其他条款的效力。</p>
            <p>• 因本条款或本站服务引起的争议，双方应友好协商解决；协商不成的，可向本站所在地有管辖权的人民法院提起诉讼。</p>
          </div>
        </CardContent>
      </Card>

      {/* Footer Note */}
      <div className="mt-8 p-6 bg-muted/50 rounded-lg text-center">
        <p className="text-sm text-muted-foreground">
          本服务条款的解释权归蚂蚁AI导航所有。感谢您选择蚂蚁AI导航，祝您使用愉快！
        </p>
      </div>
    </div>
  )
}
