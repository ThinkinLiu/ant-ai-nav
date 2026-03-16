import { NextRequest, NextResponse } from 'next/server'
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk'

interface GenerateResult {
  name: string
  description: string
  long_description: string
  category: string
  tags: string[]
  is_free: boolean
  pricing_info: string
}

export async function POST(request: NextRequest) {
  try {
    const { name, website } = await request.json()

    if (!name || !website) {
      return NextResponse.json(
        { success: false, error: '请提供工具名称和链接' },
        { status: 400 }
      )
    }

    // 提取域名用于参考
    let domain = ''
    try {
      const url = new URL(website.startsWith('http') ? website : `https://${website}`)
      domain = url.hostname.replace(/^www\./, '')
    } catch {
      domain = website
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers)
    const config = new Config()
    const client = new LLMClient(config, customHeaders)

    const systemPrompt = `你是一个AI工具信息生成助手。你需要根据用户提供的工具名称和网站链接，生成该AI工具的详细信息。

你需要返回以下信息（以JSON格式）：
{
  "name": "工具名称（可以优化用户提供的名称，使其更规范）",
  "description": "简短描述（50-100字，用于列表展示）",
  "long_description": "详细介绍（200-400字，包含主要功能、使用场景、特点等）",
  "category": "分类（从以下选项中选择最合适的一个：AI写作、AI绘画、AI对话、AI编程、AI音频、AI视频、AI办公、AI学习）",
  "tags": ["标签1", "标签2", "标签3-5个"],
  "is_free": true或false（是否有免费版本或免费功能）,
  "pricing_info": "价格信息（如：免费、免费试用、按量计费、订阅制、一次性付费等）"
}

注意：
1. 描述要客观准确，突出工具的核心价值
2. 分类要准确，如果不确定就选最接近的
3. 标签要简洁，每个标签2-4个字
4. 只返回JSON，不要有其他内容`

    const userPrompt = `请根据以下信息生成AI工具详情：
工具名称：${name}
网站链接：${website}
域名：${domain}

请分析这个工具并返回JSON格式的信息。`

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt }
    ]

    const response = await client.invoke(messages, {
      model: 'doubao-seed-1-6-251015',
      temperature: 0.7
    })

    // 解析JSON响应
    let result: GenerateResult
    try {
      // 尝试提取JSON内容
      let content = response.content.trim()
      // 如果有markdown代码块，提取其中的JSON
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (jsonMatch) {
        content = jsonMatch[1].trim()
      }
      result = JSON.parse(content)
    } catch (parseError) {
      console.error('解析AI响应失败:', response.content)
      return NextResponse.json(
        { success: false, error: 'AI返回格式错误，请重试' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('生成工具信息失败:', error)
    return NextResponse.json(
      { success: false, error: '生成失败，请稍后重试' },
      { status: 500 }
    )
  }
}
