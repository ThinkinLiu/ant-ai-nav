import { NextRequest, NextResponse } from 'next/server'
import { SearchClient, LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk'

interface NewsItem {
  title: string
  title_en: string
  summary: string
  content: string
  source: string
  source_url: string
  author: string
  category: string
  tags: string[]
  cover_image: string
  is_featured: boolean
  is_hot: boolean
  view_count: number
  like_count: number
  published_at: string
}

// AI资讯搜索API - 根据发布日期自动查询AI资讯，使用LLM处理结果
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

    // 解析日期
    const date = new Date(publishDate)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const dateStr = `${year}年${month}月${day}日`

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers)
    const config = new Config()

    // Step 1: 使用多个搜索查询获取更全面的结果
    const searchClient = new SearchClient(config, customHeaders)
    
    const searchQueries = [
      `AI人工智能 新闻 ${dateStr}`,
      `人工智能 行业动态 ${year}年${month}月${day}日`,
      `AI科技 资讯 ${month}月${day}日`,
    ]

    const allSearchResults: string[] = []

    for (const query of searchQueries) {
      const response = await searchClient.advancedSearch(query, {
        searchType: 'web',
        count: Math.floor(count / searchQueries.length) + 3,
        needSummary: false,
        needContent: true,
      })

      if (response.web_items) {
        response.web_items.forEach(item => {
          const content = `标题：${item.title}\n摘要：${item.snippet}\n内容：${item.content?.substring(0, 500) || ''}\n来源：${item.site_name}\n链接：${item.url}\n发布时间：${item.publish_time || '未知'}`
          if (!allSearchResults.some(r => r.includes(item.title))) {
            allSearchResults.push(content)
          }
        })
      }
    }

    if (allSearchResults.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: `未找到${dateStr}相关的AI资讯`,
      })
    }

    // Step 2: 使用LLM整理生成结构化资讯列表
    const llmClient = new LLMClient(config, customHeaders)

    const systemPrompt = `你是一位专业的AI行业编辑，负责筛选和整理AI相关的新闻资讯。

筛选标准：
1. 必须是AI人工智能相关的新闻、产品发布、技术动态
2. 发布日期必须准确，优先选择${dateStr}当天或前后1-2天的资讯
3. 资讯来源要可靠，排除广告、软文类内容
4. 内容要有实质价值，排除标题党

分类标准：
- industry（行业动态）：行业发展、政策法规、市场趋势
- product（产品发布）：AI产品发布、功能更新
- research（学术研究）：论文发表、研究成果
- tutorial（教程指南）：技术教程、使用指南

请严格筛选，只保留真正有价值的AI资讯。每条资讯需要提取准确的发布日期。`

    const userPrompt = `请根据以下搜索结果，整理${dateStr}的AI资讯：

${allSearchResults.slice(0, 15).join('\n\n---\n\n')}

请严格按照以下JSON格式输出（不要输出其他内容）：
{
  "news": [
    {
      "title": "资讯标题",
      "title_en": "English Title（如果原文有英文标题则填写，否则留空）",
      "summary": "50-100字的简短摘要",
      "content": "200-500字的详细内容（基于搜索结果整理，不要编造）",
      "source": "来源名称",
      "source_url": "原文链接",
      "author": "作者或来源机构",
      "category": "industry/product/research/tutorial",
      "tags": ["标签1", "标签2"],
      "published_at": "YYYY-MM-DD格式的发布日期"
    }
  ]
}

注意：
1. 只保留AI人工智能相关的资讯
2. 发布日期优先使用原文的发布时间，格式化为YYYY-MM-DD
3. 如果无法确定具体日期，使用"${publishDate}"作为默认值
4. 每条资讯的内容必须基于搜索结果，不得编造
5. 最多输出${count}条资讯
6. 如果搜索结果中没有足够的AI相关资讯，返回空数组`

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]

    const llmResponse = await llmClient.invoke(messages, {
      temperature: 0.2,
      model: 'doubao-seed-1-8-251228'
    })

    // 解析LLM返回的JSON
    let newsItems: NewsItem[] = []
    try {
      let jsonContent = llmResponse.content.trim()
      // 移除可能的markdown代码块标记
      if (jsonContent.startsWith('```json')) {
        jsonContent = jsonContent.slice(7)
      }
      if (jsonContent.startsWith('```')) {
        jsonContent = jsonContent.slice(3)
      }
      if (jsonContent.endsWith('```')) {
        jsonContent = jsonContent.slice(0, -3)
      }
      jsonContent = jsonContent.trim()

      const parsed = JSON.parse(jsonContent)
      if (parsed.news && Array.isArray(parsed.news)) {
        newsItems = parsed.news.map((item: any) => ({
          title: item.title || '',
          title_en: item.title_en || '',
          summary: item.summary || '',
          content: item.content || item.summary || '',
          source: item.source || '网络',
          source_url: item.source_url || '',
          author: item.author || item.source || '',
          category: mapCategory(item.category),
          tags: item.tags || [],
          cover_image: '',
          is_featured: false,
          is_hot: false,
          view_count: 0,
          like_count: 0,
          published_at: item.published_at || publishDate,
        }))
      }
    } catch (parseError) {
      console.error('JSON解析错误:', parseError)
      console.error('LLM返回内容:', llmResponse.content)
      return NextResponse.json(
        { success: false, error: '资讯解析失败，请重试' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: newsItems,
      total: newsItems.length,
      searchDate: dateStr,
    })
  } catch (error) {
    console.error('搜索AI资讯错误:', error)
    return NextResponse.json(
      { success: false, error: '搜索失败，请稍后重试' },
      { status: 500 }
    )
  }
}

// 映射分类到数据库分类格式
function mapCategory(category: string): string {
  const categoryMap: Record<string, string> = {
    'industry': 'industry',
    'product': 'product',
    'research': 'research',
    'tutorial': 'tutorial',
    '行业动态': 'industry',
    '产品发布': 'product',
    '学术研究': 'research',
    '教程指南': 'tutorial',
  }
  return categoryMap[category] || 'other'
}
