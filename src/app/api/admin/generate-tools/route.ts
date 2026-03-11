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

// 预设的工具模板，作为备选
const TOOL_TEMPLATES = [
  // AI写作类
  { name: 'Jasper AI', category_id: 1, website: 'https://www.jasper.ai' },
  { name: 'Copy.ai', category_id: 1, website: 'https://www.copy.ai' },
  { name: 'Writesonic', category_id: 1, website: 'https://writesonic.com' },
  { name: 'Rytr', category_id: 1, website: 'https://rytr.me' },
  { name: 'Anyword', category_id: 1, website: 'https://anyword.com' },
  { name: 'Sudowrite', category_id: 1, website: 'https://www.sudowrite.com' },
  { name: 'NovelAI', category_id: 1, website: 'https://novelai.net' },
  { name: 'QuillBot', category_id: 1, website: 'https://quillbot.com' },
  { name: 'Grammarly', category_id: 1, website: 'https://www.grammarly.com' },
  { name: 'Wordtune', category_id: 1, website: 'https://www.wordtune.com' },
  // AI绘画类
  { name: 'Midjourney', category_id: 2, website: 'https://www.midjourney.com' },
  { name: 'DALL-E 3', category_id: 2, website: 'https://openai.com/dall-e-3' },
  { name: 'Stable Diffusion', category_id: 2, website: 'https://stability.ai' },
  { name: 'Leonardo AI', category_id: 2, website: 'https://leonardo.ai' },
  { name: 'NightCafe', category_id: 2, website: 'https://creator.nightcafe.studio' },
  { name: 'DreamStudio', category_id: 2, website: 'https://dreamstudio.ai' },
  { name: 'Ideogram', category_id: 2, website: 'https://ideogram.ai' },
  { name: 'Adobe Firefly', category_id: 2, website: 'https://firefly.adobe.com' },
  { name: 'Canva AI', category_id: 2, website: 'https://www.canva.com' },
  { name: 'Playground AI', category_id: 2, website: 'https://playground.com' },
  // AI对话类
  { name: 'ChatGPT', category_id: 3, website: 'https://chat.openai.com' },
  { name: 'Claude', category_id: 3, website: 'https://www.anthropic.com' },
  { name: 'Gemini', category_id: 3, website: 'https://gemini.google.com' },
  { name: 'Perplexity AI', category_id: 3, website: 'https://www.perplexity.ai' },
  { name: 'Poe', category_id: 3, website: 'https://poe.com' },
  { name: 'Character.AI', category_id: 3, website: 'https://character.ai' },
  { name: 'Chatsonic', category_id: 3, website: 'https://writesonic.com/chatsonic' },
  { name: 'You.com', category_id: 3, website: 'https://you.com' },
  { name: 'Phind', category_id: 3, website: 'https://www.phind.com' },
  { name: 'Pi AI', category_id: 3, website: 'https://pi.ai' },
  // AI编程类
  { name: 'GitHub Copilot', category_id: 4, website: 'https://github.com/features/copilot' },
  { name: 'Cursor', category_id: 4, website: 'https://cursor.sh' },
  { name: 'Tabnine', category_id: 4, website: 'https://www.tabnine.com' },
  { name: 'Replit AI', category_id: 4, website: 'https://replit.com' },
  { name: 'Codeium', category_id: 4, website: 'https://codeium.com' },
  { name: 'Amazon CodeWhisperer', category_id: 4, website: 'https://aws.amazon.com/codewhisperer' },
  { name: 'Sourcegraph Cody', category_id: 4, website: 'https://sourcegraph.com/cody' },
  { name: 'Mutable AI', category_id: 4, website: 'https://mutable.ai' },
  { name: 'Bolt.new', category_id: 4, website: 'https://bolt.new' },
  { name: 'V0.dev', category_id: 4, website: 'https://v0.dev' },
  // AI音频类
  { name: 'Suno AI', category_id: 5, website: 'https://suno.ai' },
  { name: 'Udio', category_id: 5, website: 'https://www.udio.com' },
  { name: 'ElevenLabs', category_id: 5, website: 'https://elevenlabs.io' },
  { name: 'Murf AI', category_id: 5, website: 'https://murf.ai' },
  { name: 'Resemble AI', category_id: 5, website: 'https://www.resemble.ai' },
  { name: 'AIVA', category_id: 5, website: 'https://www.aiva.ai' },
  { name: 'Soundraw', category_id: 5, website: 'https://soundraw.io' },
  { name: 'Amper Music', category_id: 5, website: 'https://www.ampermusic.com' },
  { name: 'Mubert', category_id: 5, website: 'https://mubert.com' },
  { name: 'Speechify', category_id: 5, website: 'https://speechify.com' },
  // AI视频类
  { name: 'Runway', category_id: 6, website: 'https://runwayml.com' },
  { name: 'Pika Labs', category_id: 6, website: 'https://pika.art' },
  { name: 'HeyGen', category_id: 6, website: 'https://www.heygen.com' },
  { name: 'Synthesia', category_id: 6, website: 'https://www.synthesia.io' },
  { name: 'D-ID', category_id: 6, website: 'https://www.d-id.com' },
  { name: 'Descript', category_id: 6, website: 'https://www.descript.com' },
  { name: 'Opus Clip', category_id: 6, website: 'https://www.opus.pro' },
  { name: 'Luma AI', category_id: 6, website: 'https://lumalabs.ai' },
  { name: 'Kaiber', category_id: 6, website: 'https://kaiber.ai' },
  { name: 'InVideo AI', category_id: 6, website: 'https://invideo.io' },
  // AI办公类
  { name: 'Notion AI', category_id: 7, website: 'https://www.notion.so' },
  { name: 'Mem AI', category_id: 7, website: 'https://mem.ai' },
  { name: 'Otter.ai', category_id: 7, website: 'https://otter.ai' },
  { name: 'Fireflies.ai', category_id: 7, website: 'https://fireflies.ai' },
  { name: 'Reclaim AI', category_id: 7, website: 'https://reclaim.ai' },
  { name: 'Motion', category_id: 7, website: 'https://www.usemotion.com' },
  { name: 'Gamma', category_id: 7, website: 'https://gamma.app' },
  { name: 'Beautiful.ai', category_id: 7, website: 'https://www.beautiful.ai' },
  { name: 'Tome', category_id: 7, website: 'https://tome.app' },
  { name: 'Taskade', category_id: 7, website: 'https://www.taskade.com' },
  // AI学习类
  { name: 'Khan Academy AI', category_id: 8, website: 'https://www.khanacademy.org' },
  { name: 'Duolingo Max', category_id: 8, website: 'https://www.duolingo.com' },
  { name: 'Quizlet AI', category_id: 8, website: 'https://quizlet.com' },
  { name: 'Photomath', category_id: 8, website: 'https://photomath.com' },
  { name: 'Socratic', category_id: 8, website: 'https://socratic.org' },
  { name: 'Century Tech', category_id: 8, website: 'https://www.century.tech' },
  { name: 'Coursera AI', category_id: 8, website: 'https://www.coursera.org' },
  { name: 'Codecademy AI', category_id: 8, website: 'https://www.codecademy.com' },
  { name: 'Brilliant AI', category_id: 8, website: 'https://brilliant.org' },
  { name: 'Elsa Speak', category_id: 8, website: 'https://elsaspeak.com' },
]

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

    // 使用预设模板作为基础，补充不足的数量
    const existingSet = new Set(existingNames.map(n => n.toLowerCase()))
    
    // 从模板中筛选出不存在的工具
    const availableTemplates = TOOL_TEMPLATES.filter(t => !existingSet.has(t.name.toLowerCase()))
    
    // 构建生成提示词，要求生成更多数量以防过滤
    const prompt = `你是一个AI工具数据库专家。请生成${count}个真实存在的在线AI网站、工具或模型。

要求：
1. 工具必须是真实存在的，参考国内外知名AI工具平台如ProductHunt、Futurepedia、Toolify、AI导航网站等
2. 每个工具需要包含：名称、简介（15-30字）、详细描述（50-100字）、网站URL、所属分类
3. 名称必须独特，不能与以下已存在的工具重复：
${existingNames.slice(0, 300).join('、')}

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
- 网站URL格式正确（必须是有效的URL格式）
- 分类准确匹配工具用途
- 描述真实反映工具特点
- 生成的工具涵盖各个分类领域
- 必须生成完整的${count}个工具

直接返回JSON数组，不要添加任何解释文字。`

    const messages = [
      { 
        role: 'system' as const, 
        content: '你是一个专业的AI工具数据库专家，熟悉全球各类AI产品和服务。你的任务是生成真实、准确的AI工具信息。你必须严格按照要求的数量生成工具，不能少生成。' 
      },
      { role: 'user' as const, content: prompt }
    ]

    let tools: any[] = []
    let retryCount = 0
    const maxRetries = 3

    // 重试机制
    while (tools.length < count && retryCount < maxRetries) {
      try {
        const response = await client.invoke(messages, { 
          model: 'doubao-seed-2-0-pro-260215',
          temperature: 0.9
        })

        // 解析返回的JSON
        let content = response.content.trim()
        // 移除可能的markdown代码块标记
        content = content.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '')
        
        const jsonMatch = content.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          if (Array.isArray(parsed)) {
            tools = parsed
          }
        }
        
        if (tools.length < count) {
          retryCount++
          // 如果生成数量不足，调整提示词再试
          messages[1] = { 
            role: 'user' as const, 
            content: `上次只生成了${tools.length}个，请再生成${count}个不同的AI工具，确保数量充足。${prompt}` 
          }
        }
      } catch (parseError) {
        retryCount++
        console.error(`第${retryCount}次尝试失败:`, parseError)
      }
    }

    // 验证和清理数据（放宽条件）
    const validTools: any[] = []
    const usedNames = new Set(existingNames)

    for (const tool of tools) {
      // 基本验证（放宽条件）
      if (!tool.name || typeof tool.name !== 'string') continue
      if (!tool.description || typeof tool.description !== 'string') continue
      
      // 检查重复
      const toolName = tool.name.trim()
      if (usedNames.has(toolName)) continue
      
      // 确保category_id有效
      let categoryId = tool.category_id
      if (typeof categoryId !== 'number' || categoryId < 1 || categoryId > 8) {
        categoryId = Math.floor(Math.random() * 8) + 1
      }

      // 生成描述（如果没有详细描述，用简介补充）
      let longDesc = tool.long_description || tool.description
      if (longDesc.length < 30) {
        longDesc = `${tool.description}该工具提供专业的AI服务，帮助用户提高工作效率。`
      }

      validTools.push({
        name: toolName.substring(0, 100),
        slug: generateSlug(toolName),
        description: tool.description.substring(0, 200),
        long_description: longDesc.substring(0, 500),
        website: normalizeUrl(tool.website || ''),
        category_id: categoryId,
        publisher_id: 'system-import',
        status: 'approved',
        is_featured: false,
        is_free: true,
        view_count: Math.floor(Math.random() * 1000) + 100,
        favorite_count: Math.floor(Math.random() * 100) + 10
      })
      
      usedNames.add(toolName)
    }

    // 如果LLM生成的数量仍然不足，用模板补充
    if (validTools.length < count && availableTemplates.length > 0) {
      const needed = count - validTools.length
      const templatesToAdd = availableTemplates
        .filter(t => !usedNames.has(t.name))
        .slice(0, needed)

      for (const template of templatesToAdd) {
        const category = CATEGORIES.find(c => c.id === template.category_id)
        validTools.push({
          name: template.name,
          slug: generateSlug(template.name),
          description: `${category?.name || 'AI'}领域的优秀工具，提供专业的智能服务`,
          long_description: `${template.name}是一款专注于${category?.name || 'AI'}领域的智能工具，为用户提供高效便捷的服务体验。通过先进的AI技术，帮助用户快速完成任务，提升工作效率。`,
          website: template.website,
          category_id: template.category_id,
          publisher_id: 'system-import',
          status: 'approved',
          is_featured: false,
          is_free: true,
          view_count: Math.floor(Math.random() * 1000) + 100,
          favorite_count: Math.floor(Math.random() * 100) + 10
        })
        usedNames.add(template.name)
      }
    }

    return NextResponse.json({ 
      success: true,
      batch,
      requested: count,
      generated: validTools.length,
      fromLLM: tools.length,
      retries: retryCount,
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
