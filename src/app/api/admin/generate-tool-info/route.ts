import { NextRequest, NextResponse } from 'next/server'
import { LLMClient, SearchClient, Config, HeaderUtils } from 'coze-coding-dev-sdk'

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

    // 提取域名
    let domain = ''
    try {
      const url = new URL(website.startsWith('http') ? website : `https://${website}`)
      domain = url.hostname.replace(/^www\./, '')
    } catch {
      domain = website
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers)
    const config = new Config()

    // Step 1: 搜索工具的真实信息
    const searchClient = new SearchClient(config, customHeaders)
    
    // 构建搜索查询
    const searchQuery = `${name} AI工具 功能介绍 官网`
    
    let searchResults = ''
    let hasRealInfo = false
    let relevantItems: any[] = []
    
    try {
      const searchResponse = await searchClient.advancedSearch(searchQuery, {
        searchType: 'web',
        count: 8,
        needContent: true,
        needSummary: false,
      })

      if (searchResponse.web_items && searchResponse.web_items.length > 0) {
        const nameLower = name.toLowerCase()
        const domainLower = domain.toLowerCase()
        
        // 严格过滤：只保留确实包含工具名称或域名的结果
        relevantItems = searchResponse.web_items.filter((item: any) => {
          const titleLower = (item.title || '').toLowerCase()
          const snippetLower = (item.snippet || '').toLowerCase()
          const contentLower = (item.content || '').substring(0, 1500).toLowerCase()
          const urlLower = (item.url || '').toLowerCase()
          
          // 检查是否包含工具名称（至少2个字符的匹配）
          const nameWords = nameLower.split(/[\s\-_]+/).filter((w: string) => w.length >= 2)
          const hasNameMatch = nameWords.some((word: string) => 
            titleLower.includes(word) || 
            snippetLower.includes(word) ||
            contentLower.includes(word)
          )
          
          // 检查是否包含域名
          const hasDomainMatch = domainLower.length > 3 && (
            urlLower.includes(domainLower) ||
            snippetLower.includes(domainLower) ||
            contentLower.includes(domainLower)
          )
          
          return hasNameMatch || hasDomainMatch
        })

        // 只有找到相关结果时才认为有真实信息
        if (relevantItems.length > 0) {
          hasRealInfo = true
          searchResults = relevantItems
            .map((item: any, index: number) => {
              const parts = [`[${index + 1}] ${item.title}`]
              if (item.url) parts.push(`链接: ${item.url}`)
              if (item.snippet) parts.push(`摘要: ${item.snippet}`)
              if (item.content) parts.push(`内容: ${item.content.substring(0, 800)}`)
              return parts.join('\n')
            })
            .join('\n\n---\n\n')
        }
      }
    } catch (searchError) {
      console.error('搜索失败:', searchError)
    }

    // 如果没有搜索到真实信息，返回提示
    if (!hasRealInfo) {
      return NextResponse.json({
        success: false,
        error: `无法获取"${name}"的详细信息。可能原因：
1. 该工具较为冷门，网络上缺乏相关介绍
2. 工具名称或网址有误
3. 网络搜索服务暂时不可用

建议：请手动填写工具信息，或提供更准确的工具名称和官网地址。`,
        data: {
          name: name,
          website: website
        }
      })
    }

    // Step 2: 基于搜索结果使用 LLM 整理信息（返回HTML格式的详细介绍）
    const llmClient = new LLMClient(config, customHeaders)

    const systemPrompt = `你是一个AI工具信息整理助手。你需要根据搜索到的真实信息，整理该AI工具的详细信息。

**重要规则**：
1. 只使用搜索结果中提到的信息，不要编造或推测
2. 如果某些信息在搜索结果中未提及，用"暂无信息"或合理的默认值表示
3. 描述要客观准确，基于搜索结果中的实际内容
4. **详细介绍(long_description)必须返回HTML格式**，以便在网页中直接渲染

你需要返回以下信息（以JSON格式）：
{
  "name": "工具名称（规范化的名称）",
  "description": "简短描述（50-100字，用于列表展示，必须基于搜索结果）",
  "long_description": "详细介绍（HTML格式，包含主要功能、使用场景、特点等）。必须使用HTML标签：
- <h3>标签</h3> 用于小标题
- <ul><li>标签</li></ul> 用于列表
- <p>标签</p> 用于段落
- 不要使用任何图片标签（img），只保留文字内容
- 如果搜索结果中有多个功能点，使用<h3>+<ul><li>结构组织
- 确保HTML格式正确，可被浏览器正常渲染",
  "category": "分类（从以下选项中选择最合适的一个：AI写作、AI绘画、AI对话、AI编程、AI音频、AI视频、AI办公、AI学习）",
  "tags": ["标签1", "标签2", "标签3-5个"],
  "is_free": true或false（是否有免费版本或免费功能，无法确定时设为true）,
  "pricing_info": "价格信息（如：免费、免费试用、按量计费、订阅制等，无法确定时写"暂无信息"）"
}

**详细介绍(long_description)的HTML格式示例**：
<h3>核心功能</h3>
<ul>
<li>功能点1：详细描述</li>
<li>功能点2：详细描述</li>
</ul>
<h3>使用场景</h3>
<p>使用场景的详细描述...</p>

注意：
1. 如果搜索结果信息不足以生成完整的描述，请如实说明"根据搜索结果，该工具..."
2. 标签要简洁，每个标签2-4个字
3. long_description必须是合法的HTML格式，不要有未闭合的标签
4. 只返回JSON，不要有其他内容`

    const userPrompt = `请根据以下搜索结果，整理"${name}"（官网：${website}）的工具信息：

${searchResults}

请严格按照搜索结果中的信息生成JSON格式的工具详情。详细介绍必须使用HTML格式，包含<h3>标题和<ul><li>列表等标签。不要编造任何信息。`

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
      // 如果有markdown代码块，提取其中的JSON
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (jsonMatch) {
        content = jsonMatch[1].trim()
      }
      result = JSON.parse(content)
    } catch (parseError) {
      console.error('解析AI响应失败:', response.content)
      return NextResponse.json({
        success: false,
        error: '信息解析失败，AI返回的格式无法解析。请重试或手动填写工具信息。'
      })
    }

    // 验证生成的信息是否合理（检查是否包含"暂无信息"等占位符过多）
    const textFields = [result.description, result.pricing_info]
    // 过滤掉HTML标签后检查
    const longDescText = result.long_description?.replace(/<[^>]+>/g, '') || ''
    const allTextFields = [...textFields, longDescText]
    
    const placeholderCount = allTextFields
      .filter(text => text.includes('暂无') || text.includes('无法') || text.includes('不确定'))
      .length

    if (placeholderCount >= 2 && longDescText.length < 50) {
      return NextResponse.json({
        success: false,
        error: `搜索到的信息不足以生成完整的工具介绍（有效内容过少）。建议手动填写工具信息。\n\n已搜索到的片段：\n${searchResults.substring(0, 500)}...`
      })
    }

    // 确保long_description是HTML格式
    if (result.long_description && !result.long_description.includes('<')) {
      // 如果返回的不是HTML，转换为简单的段落格式
      result.long_description = `<p>${result.long_description.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`
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
    console.error('生成工具信息失败:', error)
    return NextResponse.json({
      success: false,
      error: '服务暂时不可用，请稍后重试或手动填写工具信息'
    })
  }
}
