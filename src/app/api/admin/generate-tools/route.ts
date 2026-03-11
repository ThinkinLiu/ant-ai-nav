import { NextRequest, NextResponse } from 'next/server'
import { LLMClient, Config } from 'coze-coding-dev-sdk'

// 分类配置
const CATEGORIES = [
  { id: 1, name: 'AI写作', keywords: ['写作', '文案', '文章', '内容创作', '小说', '博客', 'SEO写作', '营销文案'] },
  { id: 2, name: 'AI绘画', keywords: ['绘画', '图像生成', 'AI画', '插画', '设计', '艺术', '图片生成', '图像创作'] },
  { id: 3, name: 'AI对话', keywords: ['对话', '聊天', '问答', '助手', 'Chat', '智能客服', '聊天机器人'] },
  { id: 4, name: 'AI编程', keywords: ['编程', '代码', '开发', 'Copilot', '代码生成', '代码助手', 'IDE'] },
  { id: 5, name: 'AI音频', keywords: ['音频', '语音', '配音', 'TTS', '音乐', '声音', '语音合成'] },
  { id: 6, name: 'AI视频', keywords: ['视频', '剪辑', '动画', '短视频', '视频生成', '视频编辑'] },
  { id: 7, name: 'AI办公', keywords: ['办公', '文档', 'PPT', '表格', '协作', '效率', '自动化'] },
  { id: 8, name: 'AI学习', keywords: ['学习', '教育', '课程', '翻译', '语言', '知识', '培训'] }
]

// 已存在的工具名称（从请求体传入）
interface GenerateRequest {
  existingNames: string[]
  count: number
  batch: number
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json()
    const { existingNames, count = 100, batch = 1 } = body

    const config = new Config()
    const client = new LLMClient(config)

    // 构建生成提示词
    const prompt = `你是一个AI工具数据库专家。请生成${count}个真实存在的在线AI网站、工具或模型。

要求：
1. 工具必须是真实存在的，参考国内外知名AI工具平台如ProductHunt、Futurepedia、Toolify、AI导航网站等
2. 每个工具需要包含：名称、简介（15-30字）、详细描述（50-100字）、网站URL、所属分类
3. 名称必须独特，不能与以下已存在的工具重复：
${existingNames.slice(0, 500).join('、')}

4. 分类选择范围：
${CATEGORIES.map(c => `${c.id}. ${c.name}`).join('\n')}

5. 返回JSON数组格式，严格遵循以下结构：
[
  {
    "name": "工具名称",
    "description": "简短介绍15-30字",
    "long_description": "详细描述50-100字，说明工具的主要功能、特点、适用场景",
    "website": "https://工具官网.com",
    "category_id": 分类ID(1-8)
  }
]

请确保：
- 名称简洁有力，不重复
- 网站URL格式正确
- 分类准确匹配工具用途
- 描述真实反映工具特点
- 生成的工具涵盖各个分类领域

直接返回JSON数组，不要添加任何解释文字。`

    const messages = [
      { 
        role: 'system' as const, 
        content: '你是一个专业的AI工具数据库专家，熟悉全球各类AI产品和服务。你的任务是生成真实、准确的AI工具信息。' 
      },
      { role: 'user' as const, content: prompt }
    ]

    const response = await client.invoke(messages, { 
      model: 'doubao-seed-2-0-pro-260215',
      temperature: 0.8 
    })

    // 解析返回的JSON
    let tools = []
    try {
      // 提取JSON数组部分
      let content = response.content.trim()
      // 移除可能的markdown代码块标记
      content = content.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '')
      
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        tools = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('未找到有效的JSON数组')
      }
    } catch (parseError) {
      console.error('解析JSON失败:', parseError)
      return NextResponse.json({ 
        error: '解析生成的数据失败', 
        rawContent: response.content 
      }, { status: 500 })
    }

    // 验证和清理数据
    const validTools = tools.filter((tool: any) => {
      return tool.name && 
             tool.description && 
             tool.long_description && 
             tool.website &&
             tool.category_id >= 1 && 
             tool.category_id <= 8 &&
             !existingNames.includes(tool.name)
    }).map((tool: any) => ({
      name: tool.name.substring(0, 100),
      slug: generateSlug(tool.name),
      description: tool.description.substring(0, 200),
      long_description: tool.long_description.substring(0, 500),
      website: normalizeUrl(tool.website),
      category_id: tool.category_id,
      status: 'approved',
      is_featured: false,
      is_free: true,
      view_count: Math.floor(Math.random() * 1000) + 100,
      favorite_count: Math.floor(Math.random() * 100) + 10
    }))

    return NextResponse.json({ 
      success: true,
      batch,
      generated: validTools.length,
      tools: validTools 
    })

  } catch (error) {
    console.error('生成工具数据失败:', error)
    return NextResponse.json({ 
      error: '生成失败: ' + (error as Error).message 
    }, { status: 500 })
  }
}

// 生成URL友好的slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50)
}

// 规范化URL
function normalizeUrl(url: string): string {
  if (!url) return ''
  url = url.trim()
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url
  }
  return url.substring(0, 255)
}
