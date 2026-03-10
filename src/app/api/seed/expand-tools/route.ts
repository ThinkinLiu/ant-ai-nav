import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 生成更多AI工具数据
function generateMoreTools(): Array<{
  name: string
  description: string
  website: string
  category: string
  isFree: boolean
  isFeatured?: boolean
}> {
  const tools: Array<{
    name: string
    description: string
    website: string
    category: string
    isFree: boolean
    isFeatured?: boolean
  }> = []

  // AI写作细分领域工具
  const writingPrefixes = ['Write', 'Draft', 'Compose', 'Create', 'Generate', 'Auto', 'Smart', 'AI', 'Content', 'Text', 'Copy', 'Blog', 'Article', 'Story', 'Novel', 'Essay', 'Resume', 'Letter', 'Email', 'Ad']
  const writingSuffixes = ['Bot', 'Gen', 'Writer', 'Master', 'Pro', 'Hub', 'Lab', 'Studio', 'AI', 'GPT', 'Helper', 'Assistant', 'Maker', 'Creator', 'Builder', 'Forge', 'Works', 'Labs', 'Tool', 'App']
  const writingDescs = ['AI内容写作工具', '智能文章生成器', 'AI文案助手', '自动写作平台', 'AI故事创作', '智能博客生成', 'AI邮件写作', '营销文案AI', 'AI简历生成', '智能报告撰写']
  
  for (let i = 0; i < 200; i++) {
    const prefix = writingPrefixes[i % writingPrefixes.length]
    const suffix = writingSuffixes[Math.floor(i / writingPrefixes.length) % writingSuffixes.length]
    const name = `${prefix}${suffix} ${Math.floor(i / 20) + 1}`
    tools.push({
      name,
      description: writingDescs[i % writingDescs.length] + `，专业高效`,
      website: `https://www.${name.toLowerCase().replace(/\s+/g, '')}.com`,
      category: 'ai-writing',
      isFree: Math.random() > 0.5,
    })
  }

  // AI绘画细分领域工具
  const paintingPrefixes = ['Art', 'Draw', 'Paint', 'Sketch', 'Image', 'Photo', 'Picture', 'Canvas', 'Pixel', 'Design', 'Create', 'Dream', 'Imagine', 'Visual', 'Graphic', 'Render', 'Scene', 'Vision', 'Color', 'Brush']
  const paintingSuffixes = ['AI', 'Bot', 'Gen', 'Master', 'Pro', 'Hub', 'Lab', 'Studio', 'Maker', 'Creator', 'Artist', 'Painter', 'Studio', 'Works', 'Labs', 'App', 'Tool', 'Forge', 'Builder', 'Engine']
  const paintingDescs = ['AI图像生成工具', '智能绘画助手', 'AI艺术创作', '自动图像生成', 'AI设计工具', '智能照片处理', 'AI插画生成', '艺术风格转换', 'AI海报设计', '智能修图']
  
  for (let i = 0; i < 200; i++) {
    const prefix = paintingPrefixes[i % paintingPrefixes.length]
    const suffix = paintingSuffixes[Math.floor(i / paintingPrefixes.length) % paintingSuffixes.length]
    const name = `${prefix}${suffix} ${Math.floor(i / 20) + 1}`
    tools.push({
      name,
      description: paintingDescs[i % paintingDescs.length] + `，创意无限`,
      website: `https://www.${name.toLowerCase().replace(/\s+/g, '')}.ai`,
      category: 'ai-painting',
      isFree: Math.random() > 0.5,
    })
  }

  // AI对话细分领域工具
  const chatPrefixes = ['Chat', 'Talk', 'Speak', 'Converse', 'Dialog', 'Message', 'Bot', 'Assistant', 'Agent', 'Companion', 'Friend', 'Advisor', 'Consultant', 'Guide', 'Mentor', 'Coach', 'Helper', 'Support', 'Reply', 'Answer']
  const chatSuffixes = ['AI', 'Bot', 'GPT', 'Pro', 'Plus', 'Max', 'Hub', 'Lab', 'Now', 'Live', 'X', 'One', 'Go', 'Me', 'You', 'We', 'Us', 'IO', 'AI', 'App']
  const chatDescs = ['AI对话助手', '智能聊天机器人', 'AI客服系统', '自动对话平台', 'AI问答助手', '智能语音交互', 'AI聊天应用', '对话生成系统', 'AI沟通工具', '智能助手']
  
  for (let i = 0; i < 200; i++) {
    const prefix = chatPrefixes[i % chatPrefixes.length]
    const suffix = chatSuffixes[Math.floor(i / chatPrefixes.length) % chatSuffixes.length]
    const name = `${prefix}${suffix} ${Math.floor(i / 20) + 1}`
    tools.push({
      name,
      description: chatDescs[i % chatDescs.length] + `，智能响应`,
      website: `https://www.${name.toLowerCase().replace(/\s+/g, '')}.io`,
      category: 'ai-chat',
      isFree: Math.random() > 0.4,
    })
  }

  // AI编程细分领域工具
  const codingPrefixes = ['Code', 'Dev', 'Build', 'Compile', 'Debug', 'Test', 'Deploy', 'Ship', 'Stack', 'Engine', 'Runtime', 'Cloud', 'Server', 'API', 'SDK', 'CLI', 'IDE', 'Editor', 'Platform', 'Framework']
  const codingSuffixes = ['AI', 'Bot', 'Gen', 'Pro', 'Dev', 'Hub', 'Lab', 'Studio', 'Maker', 'Builder', 'Creator', 'Forge', 'Works', 'Labs', 'Tool', 'App', 'Engine', 'Platform', 'Cloud', 'X']
  const codingDescs = ['AI代码生成器', '智能编程助手', 'AI开发工具', '自动代码补全', 'AI代码审查', '智能测试工具', 'AI部署平台', '代码优化工具', 'AI调试助手', '智能重构工具']
  
  for (let i = 0; i < 200; i++) {
    const prefix = codingPrefixes[i % codingPrefixes.length]
    const suffix = codingSuffixes[Math.floor(i / codingPrefixes.length) % codingSuffixes.length]
    const name = `${prefix}${suffix} ${Math.floor(i / 20) + 1}`
    tools.push({
      name,
      description: codingDescs[i % codingDescs.length] + `，高效开发`,
      website: `https://www.${name.toLowerCase().replace(/\s+/g, '')}.dev`,
      category: 'ai-coding',
      isFree: Math.random() > 0.5,
    })
  }

  // AI音频细分领域工具
  const audioPrefixes = ['Sound', 'Audio', 'Voice', 'Music', 'Song', 'Track', 'Beat', 'Mix', 'Master', 'Record', 'Speech', 'Talk', 'Listen', 'Hear', 'Tune', 'Audio', 'Wave', 'Frequency', 'Rhythm', 'Melody']
  const audioSuffixes = ['AI', 'Bot', 'Gen', 'Pro', 'Studio', 'Hub', 'Lab', 'Maker', 'Creator', 'Artist', 'Producer', 'Engineer', 'Works', 'Labs', 'Tool', 'App', 'Engine', 'Platform', 'Cloud', 'X']
  const audioDescs = ['AI语音合成工具', '智能音乐生成器', 'AI配音平台', '自动转写工具', 'AI音频处理', '智能声音克隆', 'AI音乐创作', '语音识别系统', 'AI播客工具', '智能降噪']
  
  for (let i = 0; i < 200; i++) {
    const prefix = audioPrefixes[i % audioPrefixes.length]
    const suffix = audioSuffixes[Math.floor(i / audioPrefixes.length) % audioSuffixes.length]
    const name = `${prefix}${suffix} ${Math.floor(i / 20) + 1}`
    tools.push({
      name,
      description: audioDescs[i % audioDescs.length] + `，专业品质`,
      website: `https://www.${name.toLowerCase().replace(/\s+/g, '')}.audio`,
      category: 'ai-audio',
      isFree: Math.random() > 0.5,
    })
  }

  // AI视频细分领域工具
  const videoPrefixes = ['Video', 'Movie', 'Film', 'Clip', 'Scene', 'Frame', 'Motion', 'Animate', 'Stream', 'Cast', 'Play', 'Show', 'Watch', 'View', 'Screen', 'Visual', 'Motion', 'Cinema', 'Reel', 'Shot']
  const videoSuffixes = ['AI', 'Bot', 'Gen', 'Pro', 'Studio', 'Hub', 'Lab', 'Maker', 'Creator', 'Editor', 'Producer', 'Director', 'Works', 'Labs', 'Tool', 'App', 'Engine', 'Platform', 'Cloud', 'X']
  const videoDescs = ['AI视频生成工具', '智能视频编辑器', 'AI动画制作', '自动视频创作', 'AI视频剪辑', '智能字幕生成', 'AI视频增强', '视频风格转换', 'AI短视频工具', '智能直播助手']
  
  for (let i = 0; i < 200; i++) {
    const prefix = videoPrefixes[i % videoPrefixes.length]
    const suffix = videoSuffixes[Math.floor(i / videoPrefixes.length) % videoSuffixes.length]
    const name = `${prefix}${suffix} ${Math.floor(i / 20) + 1}`
    tools.push({
      name,
      description: videoDescs[i % videoDescs.length] + `，创意无限`,
      website: `https://www.${name.toLowerCase().replace(/\s+/g, '')}.video`,
      category: 'ai-video',
      isFree: Math.random() > 0.5,
    })
  }

  // AI办公细分领域工具
  const officePrefixes = ['Office', 'Work', 'Team', 'Task', 'Project', 'Doc', 'Sheet', 'Slide', 'Note', 'Meet', 'Calendar', 'Email', 'Chat', 'Share', 'Sync', 'Cloud', 'Drive', 'Space', 'Zone', 'Desk']
  const officeSuffixes = ['AI', 'Bot', 'Gen', 'Pro', 'Hub', 'Lab', 'Studio', 'Maker', 'Creator', 'Builder', 'Manager', 'Assistant', 'Works', 'Labs', 'Tool', 'App', 'Engine', 'Platform', 'Cloud', 'X']
  const officeDescs = ['AI办公助手', '智能文档处理', 'AI项目管理', '自动任务调度', 'AI会议助手', '智能日程管理', 'AI协作文档', '智能表单处理', 'AI知识管理', '自动化工作流']
  
  for (let i = 0; i < 200; i++) {
    const prefix = officePrefixes[i % officePrefixes.length]
    const suffix = officeSuffixes[Math.floor(i / officePrefixes.length) % officeSuffixes.length]
    const name = `${prefix}${suffix} ${Math.floor(i / 20) + 1}`
    tools.push({
      name,
      description: officeDescs[i % officeDescs.length] + `，效率提升`,
      website: `https://www.${name.toLowerCase().replace(/\s+/g, '')}.work`,
      category: 'ai-office',
      isFree: Math.random() > 0.4,
    })
  }

  // AI学习细分领域工具
  const learningPrefixes = ['Learn', 'Study', 'Course', 'Class', 'Lesson', 'Teach', 'Train', 'Skill', 'Edu', 'Academy', 'School', 'College', 'University', 'Tutor', 'Coach', 'Mentor', 'Quiz', 'Test', 'Exam', 'Practice']
  const learningSuffixes = ['AI', 'Bot', 'Gen', 'Pro', 'Hub', 'Lab', 'Studio', 'Maker', 'Creator', 'Builder', 'Master', 'Assistant', 'Works', 'Labs', 'Tool', 'App', 'Engine', 'Platform', 'Cloud', 'X']
  const learningDescs = ['AI学习助手', '智能教育平台', 'AI课程推荐', '自动作业批改', 'AI语言学习', '智能题库系统', 'AI知识图谱', '个性化学习', 'AI考试助手', '智能学习计划']
  
  for (let i = 0; i < 200; i++) {
    const prefix = learningPrefixes[i % learningPrefixes.length]
    const suffix = learningSuffixes[Math.floor(i / learningPrefixes.length) % learningSuffixes.length]
    const name = `${prefix}${suffix} ${Math.floor(i / 20) + 1}`
    tools.push({
      name,
      description: learningDescs[i % learningDescs.length] + `，学习更轻松`,
      website: `https://www.${name.toLowerCase().replace(/\s+/g, '')}.learn`,
      category: 'ai-learning',
      isFree: Math.random() > 0.4,
    })
  }

  return tools
}

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

    // 获取当前工具数量
    const { count: currentCount } = await client
      .from('ai_tools')
      .select('*', { count: 'exact', head: true })

    const targetCount = 2000
    const needToAdd = targetCount - (currentCount || 0)
    
    if (needToAdd <= 0) {
      return NextResponse.json({
        success: true,
        message: '已达到目标数量',
        data: { current: currentCount, target: targetCount },
      })
    }

    // 生成工具数据
    const allTools = generateMoreTools()
    
    let successCount = 0
    let skipCount = 0
    const batchSize = 100

    // 分批处理
    for (let i = 0; i < Math.min(allTools.length, needToAdd + 200); i += batchSize) {
      const batch = allTools.slice(i, i + batchSize)
      
      const insertPromises = batch.map(async (tool) => {
        const categoryId = categoryMap.get(tool.category)
        if (!categoryId) return null

        // 生成唯一slug
        const slug = tool.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') + '-' + Math.random().toString(36).substring(2, 8)

        const { error } = await client
          .from('ai_tools')
          .insert({
            name: tool.name,
            slug,
            description: tool.description,
            long_description: `${tool.name}是一款专业的${tool.description}。该工具利用先进的人工智能技术，为用户提供高效便捷的解决方案。支持多种使用场景，操作简单，效果显著。`,
            website: tool.website,
            logo: null,
            category_id: categoryId,
            publisher_id: adminUser.id,
            status: 'approved',
            is_featured: tool.isFeatured || false,
            is_free: tool.isFree,
            pricing_info: tool.isFree ? '基础功能免费使用，高级功能需付费' : '付费使用，提供免费试用，具体价格请访问官网',
            view_count: Math.floor(Math.random() * 5000) + 100,
            favorite_count: Math.floor(Math.random() * 500) + 10,
          })

        return error ? null : tool
      })

      const results = await Promise.all(insertPromises)
      successCount += results.filter(Boolean).length
      skipCount += results.filter(r => r === null).length

      // 每批次后暂停一小段时间
      await new Promise(resolve => setTimeout(resolve, 50))
    }

    // 获取最终统计
    const { count: totalCount } = await client
      .from('ai_tools')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      success: true,
      message: '扩展导入完成',
      data: {
        success: successCount,
        skipped: skipCount,
        totalInDb: totalCount,
        target: targetCount,
      },
    })
  } catch (error) {
    console.error('扩展导入错误:', error)
    return NextResponse.json(
      { success: false, error: '扩展导入失败' },
      { status: 500 }
    )
  }
}
