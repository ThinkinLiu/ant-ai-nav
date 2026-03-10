import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 100个AI工具数据
const aiToolsData = [
  // AI写作类
  { name: 'Jasper', description: 'AI营销文案写作工具，快速生成高质量营销内容', website: 'https://jasper.ai', category: 'ai-writing', isFree: false, isFeatured: true },
  { name: 'Copy.ai', description: 'AI文案生成器，自动创建广告文案和社交媒体内容', website: 'https://copy.ai', category: 'ai-writing', isFree: false },
  { name: 'Writesonic', description: 'AI写作助手，生成博客、广告、邮件等多种内容', website: 'https://writesonic.com', category: 'ai-writing', isFree: false },
  { name: 'Rytr', description: 'AI写作工具，快速生成各种类型的内容', website: 'https://rytr.me', category: 'ai-writing', isFree: false },
  { name: 'Anyword', description: 'AI营销文案平台，优化广告转化率', website: 'https://anyword.com', category: 'ai-writing', isFree: false },
  { name: 'Sudowrite', description: 'AI小说创作助手，帮助作家完成故事创作', website: 'https://sudowrite.com', category: 'ai-writing', isFree: false },
  { name: 'NovelAI', description: 'AI故事生成工具，创作小说和图像', website: 'https://novelai.net', category: 'ai-writing', isFree: false },
  { name: 'AI-Writer', description: 'AI文章生成器，自动撰写SEO优化内容', website: 'https://ai-writer.com', category: 'ai-writing', isFree: false },
  { name: 'Article Forge', description: 'AI长文生成工具，自动创作SEO文章', website: 'https://articleforge.com', category: 'ai-writing', isFree: false },
  { name: 'ContentBot', description: 'AI内容生成平台，支持多种写作场景', website: 'https://contentbot.ai', category: 'ai-writing', isFree: false },
  { name: 'Wordtune', description: 'AI写作优化工具，改写和润色文本', website: 'https://wordtune.com', category: 'ai-writing', isFree: false },
  { name: 'Grammarly', description: 'AI语法检查和写作助手，提升写作质量', website: 'https://grammarly.com', category: 'ai-writing', isFree: true },
  { name: 'QuillBot', description: 'AI改写工具，同义词替换和句子重组', website: 'https://quillbot.com', category: 'ai-writing', isFree: true },
  { name: 'ProWritingAid', description: 'AI写作分析工具，全面提升写作技能', website: 'https://prowritingaid.com', category: 'ai-writing', isFree: false },
  { name: 'Hemingway Editor', description: 'AI写作风格优化工具，让文章更清晰', website: 'https://hemingwayapp.com', category: 'ai-writing', isFree: true },

  // AI绘画类
  { name: 'Midjourney', description: '顶级AI图像生成工具，创作惊艳艺术作品', website: 'https://midjourney.com', category: 'ai-painting', isFree: false, isFeatured: true },
  { name: 'DALL-E 3', description: 'OpenAI图像生成模型，根据文字创作图像', website: 'https://openai.com/dall-e-3', category: 'ai-painting', isFree: false, isFeatured: true },
  { name: 'Stable Diffusion', description: '开源AI绘画模型，本地部署图像生成', website: 'https://stability.ai', category: 'ai-painting', isFree: true },
  { name: 'Leonardo.AI', description: 'AI图像生成平台，专注游戏资产创作', website: 'https://leonardo.ai', category: 'ai-painting', isFree: false },
  { name: 'NightCafe', description: 'AI艺术生成器，多种风格可选', website: 'https://creator.nightcafe.studio', category: 'ai-painting', isFree: false },
  { name: 'DreamStudio', description: 'Stability AI官方图像生成平台', website: 'https://dreamstudio.ai', category: 'ai-painting', isFree: false },
  { name: 'Ideogram', description: 'AI图像生成工具，擅长文字渲染', website: 'https://ideogram.ai', category: 'ai-painting', isFree: true },
  { name: 'Adobe Firefly', description: 'Adobe AI图像生成工具，创意设计首选', website: 'https://firefly.adobe.com', category: 'ai-painting', isFree: false },
  { name: 'Canva AI', description: 'Canva内置AI图像生成功能', website: 'https://canva.com', category: 'ai-painting', isFree: true },
  { name: 'Bing Image Creator', description: '微软AI图像生成器，免费使用DALL-E', website: 'https://www.bing.com/images/create', category: 'ai-painting', isFree: true },
  { name: 'Playground AI', description: 'AI图像生成平台，支持多种模型', website: 'https://playground.com', category: 'ai-painting', isFree: true },
  { name: 'Craiyon', description: '免费AI绘画工具，简单易用', website: 'https://craiyon.com', category: 'ai-painting', isFree: true },
  { name: 'Dream by WOMBO', description: 'AI艺术生成APP，移动端创作', website: 'https://dream.ai', category: 'ai-painting', isFree: true },
  { name: 'StarryAI', description: 'AI艺术生成器，一键创建NFT', website: 'https://starryai.com', category: 'ai-painting', isFree: false },
  { name: 'Artbreeder', description: 'AI图像混合工具，创造独特角色', website: 'https://artbreeder.com', category: 'ai-painting', isFree: true },

  // AI对话类
  { name: 'ChatGPT', description: 'OpenAI旗舰AI助手，多轮对话专家', website: 'https://chat.openai.com', category: 'ai-chat', isFree: true, isFeatured: true },
  { name: 'Claude', description: 'Anthropic AI助手，擅长长文本分析', website: 'https://claude.ai', category: 'ai-chat', isFree: true, isFeatured: true },
  { name: 'Gemini', description: 'Google AI助手，多模态理解能力', website: 'https://gemini.google.com', category: 'ai-chat', isFree: true, isFeatured: true },
  { name: 'Perplexity', description: 'AI搜索引擎，实时信息检索', website: 'https://perplexity.ai', category: 'ai-chat', isFree: true },
  { name: 'Poe', description: '多模型AI聊天平台，集合多种AI', website: 'https://poe.com', category: 'ai-chat', isFree: true },
  { name: 'Character.AI', description: 'AI角色聊天，与虚拟人物对话', website: 'https://character.ai', category: 'ai-chat', isFree: true },
  { name: 'You.com', description: 'AI搜索引擎，隐私保护优先', website: 'https://you.com', category: 'ai-chat', isFree: true },
  { name: 'HuggingChat', description: '开源AI聊天助手，社区驱动', website: 'https://huggingface.co/chat', category: 'ai-chat', isFree: true },
  { name: 'Phind', description: 'AI编程搜索助手，开发者利器', website: 'https://phind.com', category: 'ai-chat', isFree: true },
  { name: 'NeevaAI', description: 'AI搜索引擎，无广告体验', website: 'https://neeva.com', category: 'ai-chat', isFree: false },
  { name: 'Jasper Chat', description: 'AI商业聊天助手，营销场景优化', website: 'https://jasper.ai/chat', category: 'ai-chat', isFree: false },
  { name: 'Chatsonic', description: 'AI聊天机器人，实时信息获取', website: 'https://writesonic.com/chatsonic', category: 'ai-chat', isFree: false },
  { name: 'Claude Instant', description: 'Claude快速版本，轻量级对话', website: 'https://claude.ai', category: 'ai-chat', isFree: true },
  { name: 'Kimi', description: '月之暗面AI助手，长文本处理专家', website: 'https://kimi.moonshot.cn', category: 'ai-chat', isFree: true },
  { name: '通义千问', description: '阿里AI助手，中文理解优秀', website: 'https://tongyi.aliyun.com', category: 'ai-chat', isFree: true },

  // AI编程类
  { name: 'GitHub Copilot', description: 'AI代码补全工具，IDE深度集成', website: 'https://github.com/features/copilot', category: 'ai-coding', isFree: false, isFeatured: true },
  { name: 'Cursor', description: 'AI代码编辑器，重新定义编程体验', website: 'https://cursor.sh', category: 'ai-coding', isFree: false, isFeatured: true },
  { name: 'Tabnine', description: 'AI代码补全，支持多种语言', website: 'https://tabnine.com', category: 'ai-coding', isFree: false },
  { name: 'Codeium', description: '免费AI代码助手，快速补全', website: 'https://codeium.com', category: 'ai-coding', isFree: true },
  { name: 'Amazon CodeWhisperer', description: 'AWS AI编程助手，安全检测', website: 'https://aws.amazon.com/codewhisperer', category: 'ai-coding', isFree: true },
  { name: 'Replit AI', description: '在线IDE内置AI，云端编程', website: 'https://replit.com', category: 'ai-coding', isFree: true },
  { name: 'Sourcegraph Cody', description: 'AI代码助手，代码库理解', website: 'https://sourcegraph.com/cody', category: 'ai-coding', isFree: true },
  { name: 'CodeGPT', description: 'VS Code AI插件，多种模型支持', website: 'https://codegpt.co', category: 'ai-coding', isFree: false },
  { name: 'Mutable.ai', description: 'AI编程工具，自动重构代码', website: 'https://mutable.ai', category: 'ai-coding', isFree: false },
  { name: 'AskCodi', description: 'AI编程助手，多语言支持', website: 'https://askcodi.com', category: 'ai-coding', isFree: false },
  { name: 'Blackbox AI', description: 'AI代码搜索，快速查找解决方案', website: 'https://blackbox.ai', category: 'ai-coding', isFree: true },
  { name: 'Pieces', description: 'AI代码片段管理，开发者效率工具', website: 'https://pieces.app', category: 'ai-coding', isFree: true },
  { name: 'Smol Developer', description: 'AI程序员，自动生成完整项目', website: 'https://github.com/smol-ai/developer', category: 'ai-coding', isFree: true },
  { name: 'GPT Engineer', description: 'AI项目生成器，描述即代码', website: 'https://github.com/gpt-engineer-org/gpt-engineer', category: 'ai-coding', isFree: true },
  { name: 'OpenDevin', description: 'AI软件开发助手，自动化编程', website: 'https://github.com/OpenDevin/OpenDevin', category: 'ai-coding', isFree: true },

  // AI音频类
  { name: 'ElevenLabs', description: '顶级AI语音合成，声音克隆专家', website: 'https://elevenlabs.io', category: 'ai-audio', isFree: false, isFeatured: true },
  { name: 'Murf.ai', description: 'AI配音工具，多语言语音生成', website: 'https://murf.ai', category: 'ai-audio', isFree: false },
  { name: 'Resemble AI', description: 'AI声音克隆，自定义语音', website: 'https://resemble.ai', category: 'ai-audio', isFree: false },
  { name: 'Descript', description: 'AI音视频编辑，文字剪辑音频', website: 'https://descript.com', category: 'ai-audio', isFree: false },
  { name: 'Play.ht', description: 'AI文本转语音，超真实人声', website: 'https://play.ht', category: 'ai-audio', isFree: false },
  { name: 'Speechify', description: 'AI朗读工具，提升阅读效率', website: 'https://speechify.com', category: 'ai-audio', isFree: false },
  { name: 'Lovo.ai', description: 'AI配音平台，200+声音可选', website: 'https://lovo.ai', category: 'ai-audio', isFree: false },
  { name: 'WellSaid Labs', description: 'AI配音工作室，商业级音频', website: 'https://wellsaidlabs.com', category: 'ai-audio', isFree: false },
  { name: 'Synthesys', description: 'AI语音和视频生成器', website: 'https://synthesys.io', category: 'ai-audio', isFree: false },
  { name: 'Listnr', description: 'AI播客制作工具，多语言支持', website: 'https://listnr.tech', category: 'ai-audio', isFree: false },
  { name: 'Speechmatics', description: 'AI语音识别，高精度转写', website: 'https://speechmatics.com', category: 'ai-audio', isFree: false },
  { name: 'Otter.ai', description: 'AI会议记录，自动转写总结', website: 'https://otter.ai', category: 'ai-audio', isFree: true },
  { name: 'Whisper', description: 'OpenAI语音识别模型，开源免费', website: 'https://openai.com/research/whisper', category: 'ai-audio', isFree: true },
  { name: 'AIVA', description: 'AI音乐创作，电影配乐生成', website: 'https://aiva.ai', category: 'ai-audio', isFree: false },
  { name: 'Soundraw', description: 'AI音乐生成器，无版权音乐', website: 'https://soundraw.io', category: 'ai-audio', isFree: false },

  // AI视频类
  { name: 'Runway', description: 'AI视频创作平台，Gen-2视频生成', website: 'https://runway.ml', category: 'ai-video', isFree: false, isFeatured: true },
  { name: 'Pika Labs', description: 'AI视频生成，文字转视频', website: 'https://pika.art', category: 'ai-video', isFree: true, isFeatured: true },
  { name: 'Synthesia', description: 'AI数字人视频，虚拟主持人', website: 'https://synthesia.io', category: 'ai-video', isFree: false },
  { name: 'HeyGen', description: 'AI视频生成，数字人配音', website: 'https://heygen.com', category: 'ai-video', isFree: false },
  { name: 'D-ID', description: 'AI数字人制作，照片变视频', website: 'https://d-id.com', category: 'ai-video', isFree: false },
  { name: 'Luma AI', description: 'AI 3D视频生成，Dream Machine', website: 'https://lumalabs.ai', category: 'ai-video', isFree: true },
  { name: 'Kaiber', description: 'AI视频生成器，艺术风格转换', website: 'https://kaiber.ai', category: 'ai-video', isFree: false },
  { name: 'Pictory', description: 'AI视频剪辑，文章转视频', website: 'https://pictory.ai', category: 'ai-video', isFree: false },
  { name: 'InVideo', description: 'AI视频制作，模板丰富', website: 'https://invideo.io', category: 'ai-video', isFree: false },
  { name: 'Veed.io', description: 'AI视频编辑，自动字幕生成', website: 'https://veed.io', category: 'ai-video', isFree: true },
  { name: 'Opus Clip', description: 'AI短视频剪辑，长视频切片', website: 'https://opus.pro', category: 'ai-video', isFree: false },
  { name: 'Fliki', description: 'AI视频创作，文本转视频', website: 'https://fliki.ai', category: 'ai-video', isFree: false },
  { name: 'Colossyan', description: 'AI培训视频制作，企业学习', website: 'https://colossyan.com', category: 'ai-video', isFree: false },
  { name: 'Bhuman', description: 'AI个性化视频，销售利器', website: 'https://bhuman.ai', category: 'ai-video', isFree: false },
  { name: 'Elai.io', description: 'AI视频生成，PPT转视频', website: 'https://elai.io', category: 'ai-video', isFree: false },

  // AI办公类
  { name: 'Notion AI', description: 'AI知识管理，智能写作助手', website: 'https://notion.so', category: 'ai-office', isFree: false, isFeatured: true },
  { name: 'Mem', description: 'AI笔记工具，自动组织知识', website: 'https://mem.ai', category: 'ai-office', isFree: false },
  { name: 'Coda AI', description: 'AI文档协作，智能表格', website: 'https://coda.io', category: 'ai-office', isFree: false },
  { name: 'Airtable AI', description: 'AI数据库，智能自动化', website: 'https://airtable.com', category: 'ai-office', isFree: false },
  { name: 'Slack AI', description: 'AI团队沟通，智能总结', website: 'https://slack.com', category: 'ai-office', isFree: false },
  { name: 'Zoom AI', description: 'AI会议助手，自动纪要', website: 'https://zoom.us', category: 'ai-office', isFree: false },
  { name: 'Fireflies.ai', description: 'AI会议记录，自动转写', website: 'https://fireflies.ai', category: 'ai-office', isFree: false },
  { name: 'Otter.ai', description: 'AI会议助手，实时字幕', website: 'https://otter.ai', category: 'ai-office', isFree: true },
  { name: 'tl;dv', description: 'AI会议录制，精彩片段', website: 'https://tldv.io', category: 'ai-office', isFree: true },
  { name: 'Magical', description: 'AI自动化，一键填写表单', website: 'https://getmagical.com', category: 'ai-office', isFree: true },
  { name: 'Reclaim.ai', description: 'AI日程管理，智能排期', website: 'https://reclaim.ai', category: 'ai-office', isFree: false },
  { name: 'Motion', description: 'AI任务管理，智能规划', website: 'https://usemotion.com', category: 'ai-office', isFree: false },
  { name: 'Clockwise', description: 'AI日历优化，专注时间', website: 'https://clockwise.com', category: 'ai-office', isFree: false },
  { name: 'Xembly', description: 'AI工作助手，任务自动化', website: 'https://xembly.com', category: 'ai-office', isFree: false },
  { name: 'Taskade', description: 'AI项目管理，团队协作', website: 'https://taskade.com', category: 'ai-office', isFree: true },

  // AI学习类
  { name: 'Duolingo MAX', description: 'AI语言学习，智能对话练习', website: 'https://duolingo.com', category: 'ai-learning', isFree: false, isFeatured: true },
  { name: 'Speak', description: 'AI口语教练，英语学习', website: 'https://speak.com', category: 'ai-learning', isFree: false },
  { name: 'Elsa Speak', description: 'AI发音矫正，英语口语', website: 'https://elsaspeak.com', category: 'ai-learning', isFree: false },
  { name: 'Quizlet Q-Chat', description: 'AI学习卡片，智能复习', website: 'https://quizlet.com', category: 'ai-learning', isFree: true },
  { name: 'Socratic', description: 'Google AI学习助手，作业帮手', website: 'https://socratic.org', category: 'ai-learning', isFree: true },
  { name: 'Photomath', description: 'AI数学解题，拍照即解', website: 'https://photomath.com', category: 'ai-learning', isFree: true },
  { name: 'Wolfram Alpha', description: 'AI计算引擎，知识问答', website: 'https://wolframalpha.com', category: 'ai-learning', isFree: false },
  { name: 'Khanmigo', description: 'Khan Academy AI导师', website: 'https://khanacademy.org', category: 'ai-learning', isFree: true },
  { name: 'Century Tech', description: 'AI个性化学习平台', website: 'https://century.tech', category: 'ai-learning', isFree: false },
  { name: 'Cognii', description: 'AI教育评估，智能辅导', website: 'https://cognii.com', category: 'ai-learning', isFree: false },
]

export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient()

    // 获取分类映射
    const { data: categories } = await client
      .from('categories')
      .select('id, slug')

    const categoryMap = new Map(categories?.map(c => [c.slug, c.id]))

    // 获取管理员用户作为发布者
    const { data: adminUser } = await client
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .limit(1)
      .single()

    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: '未找到管理员用户' },
        { status: 400 }
      )
    }

    let successCount = 0
    let skipCount = 0

    // 批量插入工具
    for (const tool of aiToolsData) {
      const categoryId = categoryMap.get(tool.category)
      if (!categoryId) {
        skipCount++
        continue
      }

      // 检查是否已存在
      const { data: existing } = await client
        .from('ai_tools')
        .select('id')
        .ilike('name', tool.name)
        .limit(1)
        .single()

      if (existing) {
        skipCount++
        continue
      }

      // 生成唯一slug
      const slug = tool.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') + '-' + Math.random().toString(36).substring(2, 6)

      const { error } = await client
        .from('ai_tools')
        .insert({
          name: tool.name,
          slug,
          description: tool.description,
          long_description: `${tool.name}是一款${tool.description}。该工具利用先进的人工智能技术，为用户提供高效便捷的解决方案。`,
          website: tool.website,
          logo: null,
          category_id: categoryId,
          publisher_id: adminUser.id,
          status: 'approved',
          is_featured: tool.isFeatured || false,
          is_free: tool.isFree,
          pricing_info: tool.isFree ? '基础功能免费使用' : '付费使用，具体价格请访问官网',
          view_count: 0,
          favorite_count: 0,
        })

      if (error) {
        console.error(`插入 ${tool.name} 失败:`, error.message)
        skipCount++
      } else {
        successCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: `批量导入完成`,
      data: {
        total: aiToolsData.length,
        success: successCount,
        skipped: skipCount,
      },
    })
  } catch (error) {
    console.error('批量导入错误:', error)
    return NextResponse.json(
      { success: false, error: '批量导入失败' },
      { status: 500 }
    )
  }
}
