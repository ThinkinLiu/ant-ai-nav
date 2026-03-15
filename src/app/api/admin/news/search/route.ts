import { NextRequest, NextResponse } from 'next/server'
import { SearchClient, Config, HeaderUtils } from 'coze-coding-dev-sdk'

// AI资讯搜索API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, count = 10, timeRange } = body

    if (!query) {
      return NextResponse.json(
        { success: false, error: '搜索关键词不能为空' },
        { status: 400 }
      )
    }

    // 使用Web Search SDK搜索AI资讯
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers)
    const config = new Config()
    const client = new SearchClient(config, customHeaders)

    // 构建搜索查询，添加AI相关前缀
    const searchQuery = `AI人工智能 ${query}`

    const response = await client.advancedSearch(searchQuery, {
      searchType: 'web',
      count: count,
      needSummary: false,
      timeRange: timeRange || '1w', // 默认搜索最近一周
      needContent: true,
    })

    if (!response.web_items || response.web_items.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: '未找到相关资讯',
      })
    }

    // 转换搜索结果为资讯格式
    const newsItems = response.web_items.map((item) => ({
      title: item.title || '',
      title_en: '',
      summary: item.snippet || '',
      content: item.content || item.snippet || '',
      source: item.site_name || '网络',
      source_url: item.url || '',
      author: item.site_name || '',
      category: '行业动态', // 默认分类
      tags: extractTags(item.title + ' ' + item.snippet),
      cover_image: '',
      is_featured: false,
      is_hot: false,
      view_count: 0,
      like_count: 0,
      published_at: item.publish_time || new Date().toISOString(),
    }))

    return NextResponse.json({
      success: true,
      data: newsItems,
      total: newsItems.length,
    })
  } catch (error) {
    console.error('搜索AI资讯错误:', error)
    return NextResponse.json(
      { success: false, error: '搜索失败，请稍后重试' },
      { status: 500 }
    )
  }
}

// 从文本中提取AI相关标签
function extractTags(text: string): string[] {
  const aiKeywords = [
    '人工智能', 'AI', '机器学习', '深度学习', '神经网络',
    'GPT', 'ChatGPT', 'Claude', '大模型', 'LLM',
    'OpenAI', 'Google', '百度', '阿里', '腾讯',
    '自动驾驶', '机器人', '计算机视觉', '自然语言处理', 'NLP',
    'AIGC', '生成式AI', '图像生成', '语音识别',
    'Midjourney', 'Stable Diffusion', '文心一言', '通义千问',
  ]

  const tags: string[] = []
  const lowerText = text.toLowerCase()

  for (const keyword of aiKeywords) {
    if (lowerText.includes(keyword.toLowerCase()) && !tags.includes(keyword)) {
      tags.push(keyword)
      if (tags.length >= 5) break // 最多5个标签
    }
  }

  return tags
}
