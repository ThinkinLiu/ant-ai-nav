import { NextRequest, NextResponse } from 'next/server'
import { SearchClient, LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk'

interface GeneratedPersonInfo {
  name: string
  nameEn: string
  title: string
  summary: string
  bio: string
  achievements: string[]
  organization: string
  organizationUrl: string
  country: string
  category: string
  tags: string[]
  birthYear: number | null
  photo: string
}

// AI名人堂自动生成API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, category } = body

    if (!name) {
      return NextResponse.json(
        { success: false, error: '请输入人物姓名' },
        { status: 400 }
      )
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers)
    const config = new Config()

    // Step 1: 搜索该人物的信息
    const searchClient = new SearchClient(config, customHeaders)
    const searchQuery = `${name} AI人工智能 贡献 成就 简介`

    const searchResponse = await searchClient.advancedSearch(searchQuery, {
      searchType: 'web',
      count: 10,
      needSummary: false,
      needContent: true,
    })

    // 整理搜索结果
    const searchContext = searchResponse.web_items
      ?.slice(0, 5)
      .map((item, index) => `[${index + 1}] ${item.title}\n${item.snippet}\n${item.content?.substring(0, 500) || ''}`)
      .join('\n\n') || ''

    if (!searchContext) {
      return NextResponse.json(
        { success: false, error: '未找到相关信息，请确认人物姓名是否正确' },
        { status: 404 }
      )
    }

    // Step 2: 使用LLM整理生成结构化信息
    const llmClient = new LLMClient(config, customHeaders)

    const systemPrompt = `你是一位专业的AI行业研究员，负责整理AI领域重要人物的信息。
请根据提供的搜索结果，生成一份准确、客观的人物简介。

要求：
1. 信息必须基于搜索结果，不得编造
2. 如果某些信息在搜索结果中未提及，用空字符串或null表示
3. 成就列表最多5条，每条简明扼要
4. 标签最多5个，提取AI相关关键词
5. 分类从以下选项中选择一个最合适的：pioneer(先驱), researcher(研究者), entrepreneur(企业家), engineer(工程师)
6. 保持内容的专业性和准确性`

    const userPrompt = `请根据以下搜索结果，整理关于"${name}"的信息：

${searchContext}

请严格按照以下JSON格式输出（不要输出其他内容）：
{
  "name": "中文名",
  "nameEn": "英文名",
  "title": "头衔/职位",
  "summary": "50-100字的简短介绍",
  "bio": "200-400字的详细介绍",
  "achievements": ["成就1", "成就2", "成就3"],
  "organization": "所属机构",
  "organizationUrl": "机构官网",
  "country": "国家",
  "category": "分类",
  "tags": ["标签1", "标签2"],
  "birthYear": 出生年份或null
}`

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]

    const llmResponse = await llmClient.invoke(messages, {
      temperature: 0.3,
      model: 'doubao-seed-1-8-251228'
    })

    // 解析LLM返回的JSON
    let personInfo: GeneratedPersonInfo
    try {
      // 尝试提取JSON内容
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

      personInfo = JSON.parse(jsonContent)
    } catch (parseError) {
      console.error('JSON解析错误:', parseError)
      console.error('LLM返回内容:', llmResponse.content)
      return NextResponse.json(
        { success: false, error: '信息解析失败，请重试' },
        { status: 500 }
      )
    }

    // 生成头像URL
    const avatarColors: Record<string, string> = {
      pioneer: '4F46E5',
      researcher: '3B82F6',
      entrepreneur: 'D97706',
      engineer: '6366F1',
      team: '4F46E5',
    }
    const color = avatarColors[personInfo.category] || '6366F1'
    const avatarName = personInfo.nameEn || personInfo.name
    personInfo.photo = `https://ui-avatars.com/api/?name=${encodeURIComponent(avatarName)}&background=${color}&color=fff&size=256&bold=true`

    // 如果用户指定了分类，使用用户指定的分类
    if (category) {
      personInfo.category = category
    }

    return NextResponse.json({
      success: true,
      data: personInfo,
    })
  } catch (error) {
    console.error('生成AI名人信息错误:', error)
    return NextResponse.json(
      { success: false, error: '生成失败，请稍后重试' },
      { status: 500 }
    )
  }
}
