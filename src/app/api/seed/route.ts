import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

const categories = [
  { name: 'AI写作', slug: 'ai-writing', description: 'AI写作助手，帮助你快速生成高质量文本内容', icon: 'PenTool', color: '#3B82F6' },
  { name: 'AI绘画', slug: 'ai-painting', description: 'AI图像生成工具，根据文字描述创建精美图像', icon: 'Palette', color: '#8B5CF6' },
  { name: 'AI对话', slug: 'ai-chat', description: '智能对话助手，提供人性化交互体验', icon: 'MessageCircle', color: '#10B981' },
  { name: 'AI编程', slug: 'ai-coding', description: 'AI辅助编程工具，提升开发效率', icon: 'Code', color: '#F59E0B' },
  { name: 'AI音频', slug: 'ai-audio', description: 'AI音频处理工具，语音识别与合成', icon: 'Music', color: '#EC4899' },
  { name: 'AI视频', slug: 'ai-video', description: 'AI视频创作与编辑工具', icon: 'Video', color: '#EF4444' },
  { name: 'AI办公', slug: 'ai-office', description: 'AI办公助手，提升工作效率', icon: 'Briefcase', color: '#6366F1' },
  { name: 'AI学习', slug: 'ai-learning', description: 'AI学习工具，智能教育辅助', icon: 'GraduationCap', color: '#14B8A6' },
]

const sampleTools = [
  {
    name: 'ChatGPT',
    description: '强大的AI对话助手，支持多轮对话、代码生成、文档写作等多种功能',
    long_description: 'ChatGPT是由OpenAI开发的大型语言模型，可以进行自然语言对话、回答问题、编写代码、撰写文章等。它基于GPT架构，经过大量文本数据训练，能够理解和生成人类语言。',
    website: 'https://chat.openai.com',
    category_slug: 'ai-chat',
    is_free: true,
    is_featured: true,
  },
  {
    name: 'Midjourney',
    description: '顶级AI图像生成工具，根据文字描述创作惊艳的艺术作品',
    long_description: 'Midjourney是一款革命性的AI图像生成工具，能够根据文本提示生成高质量的艺术图像。它被广泛应用于概念艺术、插画设计、游戏美术等领域。',
    website: 'https://midjourney.com',
    category_slug: 'ai-painting',
    is_free: false,
    is_featured: true,
  },
  {
    name: 'Claude',
    description: 'Anthropic开发的AI助手，擅长长文本处理和深度分析',
    long_description: 'Claude是由Anthropic开发的AI助手，以其出色的推理能力、长文本处理能力和安全性著称。它可以处理超过10万字的文档，进行深度分析和总结。',
    website: 'https://claude.ai',
    category_slug: 'ai-chat',
    is_free: true,
    is_featured: true,
  },
  {
    name: 'GitHub Copilot',
    description: 'AI编程助手，智能代码补全和生成',
    long_description: 'GitHub Copilot是GitHub和OpenAI合作开发的AI编程助手，可以根据上下文自动补全代码，支持多种编程语言，显著提升开发效率。',
    website: 'https://github.com/features/copilot',
    category_slug: 'ai-coding',
    is_free: false,
    is_featured: true,
  },
  {
    name: 'Notion AI',
    description: '集成AI的协作工具，智能写作和知识管理',
    long_description: 'Notion AI将人工智能深度集成到Notion工作空间中，可以帮助用户撰写、编辑、总结内容，提高工作效率和创作质量。',
    website: 'https://notion.so',
    category_slug: 'ai-office',
    is_free: false,
    is_featured: false,
  },
  {
    name: 'Jasper',
    description: 'AI营销文案写作工具，快速生成营销内容',
    long_description: 'Jasper是一款专注于营销文案的AI写作工具，支持多种内容类型，包括社交媒体帖子、博客文章、广告文案等。',
    website: 'https://jasper.ai',
    category_slug: 'ai-writing',
    is_free: false,
    is_featured: false,
  },
  {
    name: 'Runway',
    description: 'AI视频创作平台，文本生成视频',
    long_description: 'Runway是领先的AI视频创作平台，提供文本生成视频、图像动画化、视频编辑等多种功能，被众多创意专业人士使用。',
    website: 'https://runway.ml',
    category_slug: 'ai-video',
    is_free: false,
    is_featured: true,
  },
  {
    name: 'ElevenLabs',
    description: 'AI语音合成工具，生成逼真的语音',
    long_description: 'ElevenLabs是先进的AI语音合成平台，可以生成高度逼真的多语言语音，支持声音克隆和情感表达，广泛应用于有声书、游戏配音等领域。',
    website: 'https://elevenlabs.io',
    category_slug: 'ai-audio',
    is_free: false,
    is_featured: false,
  },
]

export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient()

    // 插入分类
    for (const category of categories) {
      await client
        .from('categories')
        .upsert({
          name: category.name,
          slug: category.slug,
          description: category.description,
          icon: category.icon,
          color: category.color,
          sort_order: categories.indexOf(category),
          is_active: true,
        }, { onConflict: 'slug' })
    }

    // 获取分类映射
    const { data: allCategories } = await client
      .from('categories')
      .select('id, slug')

    const categoryMap = new Map(allCategories?.map(c => [c.slug, c.id]))

    // 创建一个模拟发布者
    const { data: existingUser } = await client
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .limit(1)
      .single()

    let publisherId = existingUser?.id

    if (!publisherId) {
      // 创建一个系统管理员账户
      const { data: adminUser, error: adminError } = await client.auth.signUp({
        email: 'admin@mayiai.site',
        password: 'Admin123!',
        options: {
          data: { name: '系统管理员' },
        },
      })

      if (adminUser.user) {
        await client.from('users').insert({
          id: adminUser.user.id,
          email: 'admin@mayiai.site',
          name: '系统管理员',
          role: 'admin',
          is_active: true,
        })
        publisherId = adminUser.user.id
      }
    }

    // 插入示例工具
    for (const tool of sampleTools) {
      const categoryId = categoryMap.get(tool.category_slug)
      if (!categoryId || !publisherId) continue

      const slug = tool.name.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(2, 8)

      await client
        .from('ai_tools')
        .insert({
          name: tool.name,
          slug,
          description: tool.description,
          long_description: tool.long_description,
          website: tool.website,
          category_id: categoryId,
          publisher_id: publisherId,
          status: 'approved',
          is_featured: tool.is_featured,
          is_free: tool.is_free,
          view_count: 0,
          favorite_count: 0,
        })
    }

    return NextResponse.json({
      success: true,
      message: '种子数据初始化成功',
      data: {
        categories: categories.length,
        tools: sampleTools.length,
      },
    })
  } catch (error) {
    console.error('初始化种子数据错误:', error)
    return NextResponse.json(
      { success: false, error: '初始化失败' },
      { status: 500 }
    )
  }
}
