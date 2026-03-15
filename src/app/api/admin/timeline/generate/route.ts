import { NextRequest, NextResponse } from 'next/server'
import { SearchClient, LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk'
import { getSupabaseClient } from '@/storage/database/supabase-client'

interface TimelineEvent {
  year: number
  month: number
  day: number
  title: string
  titleEn: string
  description: string
  category: string
  importance: string
  icon: string
  image: string
  relatedUrl: string
  tags: string[]
}

// AI大事纪自动生成API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { endDate } = body

    if (!endDate) {
      return NextResponse.json(
        { success: false, error: '请输入截止日期' },
        { status: 400 }
      )
    }

    // 验证日期格式
    const endDateObj = new Date(endDate)
    if (isNaN(endDateObj.getTime())) {
      return NextResponse.json(
        { success: false, error: '日期格式不正确，请使用 YYYY-MM-DD 格式' },
        { status: 400 }
      )
    }

    const client = getSupabaseClient()

    // 获取数据库中最新的日期
    const { data: latestEvent } = await client
      .from('ai_timeline')
      .select('year, month, day')
      .order('year', { ascending: false })
      .order('month', { ascending: false })
      .order('day', { ascending: false })
      .limit(1)
      .single()

    // 计算起始日期
    let startDate: Date
    if (latestEvent) {
      startDate = new Date(latestEvent.year, (latestEvent.month || 1) - 1, (latestEvent.day || 1) + 1)
    } else {
      // 如果没有数据，从2022年11月30日（ChatGPT发布）开始
      startDate = new Date(2022, 10, 30)
    }

    // 确保起始日期不超过截止日期
    if (startDate > endDateObj) {
      return NextResponse.json(
        { success: false, error: '截止日期不能早于已有数据的最新日期' },
        { status: 400 }
      )
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers)
    const config = new Config()

    // 格式化日期用于搜索
    const formatDate = (date: Date): string => {
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
    }

    const startDateStr = formatDate(startDate)
    const endDateStr = formatDate(endDateObj)

    // Step 1: 搜索AI大事件
    const searchClient = new SearchClient(config, customHeaders)
    
    // 构建多个搜索查询以获取更全面的结果
    const searchQueries = [
      `人工智能 AI 重大事件 ${startDate.getFullYear()}年${endDateObj.getFullYear() === startDate.getFullYear() ? '' : '至' + endDateObj.getFullYear() + '年'}`,
      `AI技术突破 产品发布 ${startDate.getFullYear()}`,
      `大模型 GPT 人工智能发展 ${startDate.getFullYear()}`,
    ]

    const allSearchResults: string[] = []

    for (const query of searchQueries) {
      const response = await searchClient.advancedSearch(query, {
        searchType: 'web',
        count: 15,
        needSummary: false,
        needContent: true,
      })

      if (response.web_items) {
        response.web_items.forEach(item => {
          const content = `${item.title}\n${item.snippet}\n${item.content?.substring(0, 300) || ''}`
          if (!allSearchResults.includes(content)) {
            allSearchResults.push(content)
          }
        })
      }
    }

    if (allSearchResults.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: `在${startDateStr}至${endDateStr}期间未找到AI大事件`,
      })
    }

    // Step 2: 使用LLM整理生成结构化事件列表
    const llmClient = new LLMClient(config, customHeaders)

    const systemPrompt = `你是一位AI行业历史研究员，负责整理AI发展史上的重大事件。

筛选标准：
1. 真实性：事件必须真实发生，有可靠的公开报道
2. 影响力：事件对AI行业产生重大影响或推动作用
3. 时间准确：事件日期必须在${startDateStr}至${endDateStr}之间
4. 重要性：只选择里程碑事件或重要事件

分类标准：
- breakthrough（技术突破）：重要技术突破、算法创新、模型发布
- product（产品发布）：重要AI产品正式发布上线
- research（学术研究）：重要学术论文发表、研究成果公布
- organization（组织事件）：重要公司成立、收购、融资等

重要性标准：
- landmark（里程碑）：具有划时代意义，改变行业格局
- important（重要事件）：对行业发展有重要推动作用
- normal（普通事件）：有一定影响力但相对较小

请严格筛选，只保留真正重要的AI大事件。每个事件必须有明确的发生日期。`

    const userPrompt = `请根据以下搜索结果，整理${startDateStr}至${endDateStr}期间的AI大事件：

${allSearchResults.slice(0, 20).join('\n\n---\n\n')}

请严格按照以下JSON格式输出（不要输出其他内容）：
{
  "events": [
    {
      "year": 2024,
      "month": 3,
      "day": 14,
      "title": "事件标题",
      "titleEn": "Event Title in English",
      "description": "事件详细描述（100-200字）",
      "category": "breakthrough/product/research/organization",
      "importance": "landmark/important/normal",
      "icon": "💡/🚀/🔬/🏢",
      "relatedUrl": "相关链接（如有）",
      "tags": ["标签1", "标签2"]
    }
  ]
}

注意：
1. 只选择发生在${startDate.getFullYear()}年${startDate.getMonth() + 1}月${startDate.getDate()}日之后的真实事件
2. 每个事件必须有确切的日期（年月日）
3. 只保留对AI行业有重大影响的事件
4. 如果搜索结果中没有足够重要的真实事件，返回空数组
5. 请确保日期的准确性，不要编造日期`

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]

    const llmResponse = await llmClient.invoke(messages, {
      temperature: 0.2,
      model: 'doubao-seed-1-8-251228'
    })

    // 解析LLM返回的JSON
    let events: TimelineEvent[] = []
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
      events = parsed.events || []
    } catch (parseError) {
      console.error('JSON解析错误:', parseError)
      console.error('LLM返回内容:', llmResponse.content)
      return NextResponse.json(
        { success: false, error: '信息解析失败，请重试' },
        { status: 500 }
      )
    }

    // 过滤和验证事件
    const validEvents = events.filter(event => {
      // 验证日期范围
      const eventDate = new Date(event.year, event.month - 1, event.day)
      if (eventDate < startDate || eventDate > endDateObj) {
        return false
      }
      // 验证必要字段
      if (!event.title || !event.year || !event.month || !event.day) {
        return false
      }
      return true
    })

    // 检查重复
    const { data: existingEvents } = await client
      .from('ai_timeline')
      .select('title, year, month, day')

    const existingKeys = new Set(
      existingEvents?.map(e => `${e.title}-${e.year}-${e.month}-${e.day}`) || []
    )

    const newEvents = validEvents.filter(event => {
      const key = `${event.title}-${event.year}-${event.month}-${event.day}`
      return !existingKeys.has(key)
    })

    return NextResponse.json({
      success: true,
      data: newEvents,
      dateRange: {
        start: startDate.toISOString().split('T')[0],
        end: endDate,
        startFormatted: startDateStr,
        endFormatted: endDateStr,
      },
      total: newEvents.length,
      message: newEvents.length > 0 
        ? `找到${newEvents.length}条新的AI大事件`
        : '在指定时间范围内未找到新的AI大事件',
    })
  } catch (error) {
    console.error('生成AI大事纪错误:', error)
    return NextResponse.json(
      { success: false, error: '生成失败，请稍后重试' },
      { status: 500 }
    )
  }
}
