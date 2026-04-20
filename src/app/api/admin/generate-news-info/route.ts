import { NextRequest, NextResponse } from 'next/server'
import { LLMClient, SearchClient, Config, HeaderUtils } from 'coze-coding-dev-sdk'

interface GenerateResult {
  title: string
  summary: string
  content: string
  source: string
  sourceUrl: string
  tags: string[]
}

export async function POST(request: NextRequest) {
  try {
    const { title, sourceUrl } = await request.json()

    if (!title) {
      return NextResponse.json(
        { success: false, error: '请提供资讯标题' },
        { status: 400 }
      )
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers)
    const config = new Config()
    const searchClient = new SearchClient(config, customHeaders)

    // Step 1: 如果提供了来源URL，直接获取该页面的内容
    if (sourceUrl) {
      try {
        const sourceResponse = await fetch(sourceUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        })
        
        if (sourceResponse.ok) {
          const html = await sourceResponse.text()
          
          // 简单提取文本内容（实际生产中应该使用更专业的HTML解析库）
          const textContent = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 5000)
          
          if (textContent.length > 200) {
            // 使用LLM从网页内容中提取结构化信息
            const llmClient = new LLMClient(config, customHeaders)
            const extractPrompt = `你是一个新闻内容提取助手。我需要你从以下网页内容中提取新闻资讯的结构化信息。

**重要规则**：
1. 只提取网页中真实存在的信息，不要编造或推测
2. 如果某些信息不存在，用空字符串表示
3. 提取的内容必须来自提供的网页，不能添加网页中没有的信息

从以下网页内容中提取：
- 标题（如果有更准确的标题，使用网页中的标题）
- 摘要/导语（文章开头的重要内容）
- 正文内容（保留HTML格式，包括段落、列表等）
- 来源网站名称
- 相关标签（如果有的话）

请以JSON格式返回：
{
  "title": "标题",
  "summary": "摘要/导语（100-300字）",
  "content": "正文内容（HTML格式，保留段落和列表结构）",
  "source": "来源网站名称",
  "sourceUrl": "${sourceUrl}",
  "tags": ["标签1", "标签2", "标签3"]
}

网页内容：
${textContent.substring(0, 4000)}

请严格按照网页内容提取信息，不要编造。`

            const messages = [
              { role: 'user' as const, content: extractPrompt }
            ]

            const response = await llmClient.invoke(messages, {
              model: 'doubao-seed-1-6-251015',
              temperature: 0.3
            })

            let result: GenerateResult
            try {
              let content = response.content.trim()
              const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
              if (jsonMatch) {
                content = jsonMatch[1].trim()
              }
              result = JSON.parse(content)
              
              // 验证提取的内容质量
              const textContent2 = (result.summary + result.content).replace(/<[^>]+>/g, '')
              if (textContent2.length < 100) {
                return NextResponse.json({
                  success: false,
                  error: '从来源网页提取的内容太少，请检查来源URL是否正确，或尝试手动填写资讯内容。'
                })
              }

              // 确保content是HTML格式
              if (result.content && !result.content.includes('<')) {
                result.content = `<p>${result.content.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`
              }

              return NextResponse.json({
                success: true,
                data: result,
                meta: {
                  source: 'direct_fetch',
                  sourceUrl: sourceUrl
                }
              })
            } catch (parseError) {
              console.error('解析AI响应失败:', response.content)
              return NextResponse.json({
                success: false,
                error: '从来源网页提取信息失败。请检查来源URL是否可访问，或尝试手动填写资讯内容。'
              })
            }
          }
        }
      } catch (fetchError) {
        console.error('获取来源网页失败:', fetchError)
        // 继续使用搜索方式
      }
    }

    // Step 2: 使用网络搜索获取资讯信息
    const searchQuery = `${title} 最新 资讯 新闻`
    
    let searchResults = ''
    let hasResults = false
    let relevantItems: any[] = []
    
    try {
      const searchResponse = await searchClient.advancedSearch(searchQuery, {
        searchType: 'web',
        count: 10,
        needContent: true,
        needSummary: true,
      })

      if (searchResponse.web_items && searchResponse.web_items.length > 0) {
        // 过滤与标题相关的搜索结果
        const titleLower = title.toLowerCase()
        const titleWords = titleLower.split(/[\s\-_,，。!！?？]+/).filter((w: string) => w.length >= 2)
        
        relevantItems = searchResponse.web_items.filter((item: any) => {
          const titleLower2 = (item.title || '').toLowerCase()
          const snippetLower = (item.snippet || '').toLowerCase()
          const contentLower = (item.content || '').substring(0, 1000).toLowerCase()
          
          // 检查标题关键词匹配
          const hasKeywordMatch = titleWords.some((word: string) => 
            titleLower2.includes(word) || snippetLower.includes(word)
          )
          
          return hasKeywordMatch
        })

        if (relevantItems.length > 0) {
          hasResults = true
          searchResults = relevantItems
            .map((item: any, index: number) => {
              const parts = [`[${index + 1}] ${item.title}`]
              if (item.url) parts.push(`来源: ${item.url}`)
              if (item.snippet) parts.push(`导语: ${item.snippet}`)
              if (item.content) parts.push(`正文: ${item.content.substring(0, 1000)}`)
              return parts.join('\n')
            })
            .join('\n\n---\n\n')
        }
      }
    } catch (searchError) {
      console.error('搜索失败:', searchError)
    }

    // 如果没有搜索到相关结果
    if (!hasResults) {
      return NextResponse.json({
        success: false,
        error: `未能找到关于"${title}"的相关资讯。可能原因：
1. 该资讯较为冷门或为新发布，网络上暂无相关报道
2. 标题表述不够准确
3. 网络搜索服务暂时不可用

建议：
- 如果有来源链接，请粘贴到"来源链接"输入框，系统将直接提取网页内容
- 请尝试简化标题关键词后重试
- 或手动填写资讯内容`
      })
    }

    // Step 3: 使用 LLM 从搜索结果中提取结构化信息（不编造，只整理）
    const llmClient = new LLMClient(config, customHeaders)

    const systemPrompt = `你是一个新闻内容整理助手。你需要根据搜索到的真实信息，整理该资讯的详细信息。

**重要规则 - 必须遵守**：
1. **只使用搜索结果中真实存在的信息**，不要编造或推测任何内容
2. **禁止添加搜索结果中没有的细节**：如具体的数字、日期、名称等
3. 如果某些信息在搜索结果中未提及，用"暂无信息"表示
4. 描述要客观准确，基于搜索结果中的实际内容
5. content 必须是 HTML 格式

你需要返回以下信息（JSON格式）：
{
  "title": "资讯标题（使用搜索结果中准确的标题）",
  "summary": "摘要/导语（100-200字，基于搜索结果的snippet或开头内容）",
  "content": "正文内容（HTML格式）：
    - 使用 <p> 标签表示段落
    - 使用 <ul><li> 表示列表项
    - 只包含搜索结果中明确提到的信息点
    - 如果搜索结果只有简短摘要，内容可以是摘要的扩展版本（但不能添加新事实）
    - 如果搜索结果提到'更多详情请点击原文链接'，请在内容末尾添加此说明",
  "source": "来源网站名称（从搜索结果URL或标题中提取）",
  "sourceUrl": "来源URL（使用搜索结果中的实际URL）",
  "tags": ["标签1", "标签2", "标签3"]（从搜索结果中提取的关键词，每个2-4个字）
}

**示例（仅格式参考，内容必须基于真实搜索结果）**：
{
  "title": "某公司发布新产品",
  "summary": "该公司宣布推出一款新产品，具有某某功能，专注于某某领域...",
  "content": "<p>该公司近日宣布...</p><p>根据官方介绍...</p>",
  "source": "科技日报",
  "sourceUrl": "https://example.com/news/123",
  "tags": ["新产品", "技术发布", "人工智能"]
}

注意：
1. **绝对不要编造**搜索结果中没有的信息
2. 如果搜索结果信息非常有限（如只有标题），请如实标注摘要和内容为"暂无详细信息"
3. 标签要从搜索结果中提取的真实关键词
4. 只返回JSON，不要有其他内容`

    const userPrompt = `请根据以下搜索结果，整理"${title}"的资讯信息：

${searchResults}

**重要提醒**：
- 请只使用上述搜索结果中的真实信息
- 不要添加搜索结果中没有的细节
- 如果信息不足，请如实标注"暂无详细信息"
- content 必须使用 HTML 格式`

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt }
    ]

    const response = await llmClient.invoke(messages, {
      model: 'doubao-seed-1-6-251015',
      temperature: 0.3
    })

    // 解析JSON响应
    let result: GenerateResult
    try {
      let content = response.content.trim()
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (jsonMatch) {
        content = jsonMatch[1].trim()
      }
      result = JSON.parse(content)
    } catch (parseError) {
      console.error('解析AI响应失败:', response.content)
      return NextResponse.json({
        success: false,
        error: '信息整理失败，AI返回的格式无法解析。请尝试手动填写资讯内容。'
      })
    }

    // 验证信息质量（检查是否有足够的真实内容）
    const textContent = (result.summary + (result.content?.replace(/<[^>]+>/g, '') || '')).trim()
    if (textContent.length < 50) {
      return NextResponse.json({
        success: false,
        error: `搜索到的信息太少（有效内容不足50字），无法生成完整的资讯内容。

建议：
- 如果有来源链接，请粘贴到"来源链接"输入框，系统将直接提取网页内容
- 请尝试使用更完整的标题
- 或手动填写资讯内容`
      })
    }

    // 确保content是HTML格式
    if (result.content && !result.content.includes('<')) {
      result.content = `<p>${result.content.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`
    }

    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        source: 'web_search',
        searchQuery: searchQuery,
        itemsFound: relevantItems.length
      }
    })
  } catch (error) {
    console.error('生成资讯信息失败:', error)
    return NextResponse.json({
      success: false,
      error: '服务暂时不可用，请稍后重试或手动填写资讯内容'
    })
  }
}
