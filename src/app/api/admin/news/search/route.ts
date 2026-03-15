import { NextRequest, NextResponse } from 'next/server'
import { SearchClient, Config, HeaderUtils } from 'coze-coding-dev-sdk'

// AI资讯搜索API - 根据发布日期自动查询AI资讯
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { publishDate, count = 20 } = body

    if (!publishDate) {
      return NextResponse.json(
        { success: false, error: '发布日期不能为空' },
        { status: 400 }
      )
    }

    // 解析日期，格式化为搜索查询
    const date = new Date(publishDate)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    
    // 构建日期相关的搜索查询
    // 使用多种AI相关关键词组合搜索
    const searchQuery = `AI人工智能 ${year}年${month}月${day}日 最新动态`

    // 使用Web Search SDK搜索AI资讯
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers)
    const config = new Config()
    const client = new SearchClient(config, customHeaders)

    const response = await client.advancedSearch(searchQuery, {
      searchType: 'web',
      count: count,
      needSummary: false,
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
      published_at: item.publish_time || publishDate,
    }))

    return NextResponse.json({
      success: true,
      data: newsItems,
      total: newsItems.length,
      searchQuery, // 返回实际使用的搜索查询
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
