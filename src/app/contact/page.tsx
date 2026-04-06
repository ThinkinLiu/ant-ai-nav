import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  MessageCircle, Send, Mail, Github, 
  Globe, ExternalLink
} from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">联系我们</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          如果您有任何问题、建议或合作意向，欢迎通过以下方式与我们联系。我们会尽快回复您的消息。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 微信公众号 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-500" />
              微信公众号
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              关注「IT老五」微信公众号，获取最新AI工具资讯、使用教程和行业动态。
            </p>
            <div className="bg-muted rounded-lg p-6 flex flex-col items-center">
              <Image 
                src="/itlao5.jpg" 
                alt="IT老五公众号二维码" 
                width={128} 
                height={128}
                className="rounded-lg"
              />
              <p className="mt-3 text-sm font-medium">IT老五</p>
              <p className="text-xs text-muted-foreground">扫码关注公众号</p>
            </div>
            <p className="text-xs text-muted-foreground">
              公众号内容：AI工具推荐、技术教程、行业资讯、开源项目分享
            </p>
          </CardContent>
        </Card>

        {/* QQ群 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg className="h-5 w-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.67-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.37-.49 1.02-.75 3.98-1.73 6.64-2.87 7.97-3.43 3.79-1.57 4.58-1.84 5.09-1.85.11 0 .37.03.54.17.14.12.18.28.2.45-.01.06.01.24 0 .38z"/>
              </svg>
              QQ群
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              加入QQ交流群，与其他AI爱好者一起交流学习，分享使用心得。
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">AI工具交流群</p>
                  <p className="text-sm text-muted-foreground">群号：1091929557</p>
                </div>
                <Button asChild size="sm">
                  <a 
                    href="https://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=&authKey=&noverify=0&group_code=1091929557" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    加入群聊
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                也可在QQ中搜索群号 <span className="font-medium text-foreground">1091929557</span> 加入
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              入群须知：禁止广告、禁止刷屏，文明交流，互帮互助
            </p>
          </CardContent>
        </Card>

        {/* GitHub */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Github className="h-5 w-5" />
              GitHub
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              在GitHub上查看我们的开源项目，提交Issue或参与贡献代码。
            </p>
            <Button asChild className="w-full">
              <a
                href="https://github.com/ThinkinLiu/ant-ai-nav"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-4 w-4 mr-2" />
                访问 GitHub
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </Button>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• 查看源代码</p>
              <p>• 提交Bug反馈</p>
              <p>• 参与项目贡献</p>
            </div>
          </CardContent>
        </Card>

        {/* 个人博客 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-purple-500" />
              个人博客
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              访问IT老五个人博客，阅读技术文章和AI工具深度评测。
            </p>
            <div className="space-y-2">
              <Button asChild className="w-full" variant="outline">
                <a 
                  href="https://itlao5.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  IT老五博客
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </Button>
              <Button asChild className="w-full" variant="outline">
                <a 
                  href="https://ai.itlao5.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  AI导航5
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 邮箱联系 */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-red-500" />
              邮箱联系
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium mb-1">商务合作</p>
                <a href="mailto:business@mayiai.site" className="text-sm text-primary hover:underline">
                  business@mayiai.site
                </a>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium mb-1">问题反馈</p>
                <a href="mailto:support@mayiai.site" className="text-sm text-primary hover:underline">
                  support@mayiai.site
                </a>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium mb-1">工具推荐</p>
                <a href="mailto:submit@mayiai.site" className="text-sm text-primary hover:underline">
                  submit@mayiai.site
                </a>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              邮件回复时间：工作日 24小时内回复，周末及节假日顺延
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 反馈建议 */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-blue-500" />
            提交反馈
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            您的反馈对我们非常重要，帮助我们持续改进产品和服务。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button asChild variant="outline">
              <a
                href="https://github.com/ThinkinLiu/ant-ai-nav/issues"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-4 w-4 mr-2" />
                在GitHub提交Issue
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href="mailto:support@mayiai.site">
                <Mail className="h-4 w-4 mr-2" />
                发送邮件反馈
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
