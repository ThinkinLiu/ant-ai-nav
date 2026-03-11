import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 额外的真实AI工具（补充到500个）
const additionalTools = [
  // 更多国外AI工具
  { name: 'Together AI', website: 'https://together.ai', category: 'ai-chat', isDomestic: false },
  { name: 'Groq', website: 'https://groq.com', category: 'ai-chat', isDomestic: false },
  { name: 'Mistral AI', website: 'https://mistral.ai', category: 'ai-chat', isDomestic: false },
  { name: 'Cohere', website: 'https://cohere.com', category: 'ai-chat', isDomestic: false },
  { name: 'Aleph Alpha', website: 'https://aleph-alpha.com', category: 'ai-chat', isDomestic: false },
  { name: 'AI21 Labs', website: 'https://www.ai21.com', category: 'ai-chat', isDomestic: false },
  { name: 'Inflection AI', website: 'https://inflection.ai', category: 'ai-chat', isDomestic: false },
  { name: 'Adept AI', website: 'https://www.adept.ai', category: 'ai-chat', isDomestic: false },
  { name: 'Imbue', website: 'https://www.imbue.com', category: 'ai-chat', isDomestic: false },
  { name: 'Poolside', website: 'https://poolside.ai', category: 'ai-coding', isDomestic: false },
  { name: 'Magic.dev', website: 'https://magic.dev', category: 'ai-coding', isDomestic: false },
  { name: 'Sweep', website: 'https://sweep.dev', category: 'ai-coding', isDomestic: false },
  { name: 'Bloop', website: 'https://bloop.ai', category: 'ai-coding', isDomestic: false },
  { name: 'Grit', website: 'https://app.grit.io', category: 'ai-coding', isDomestic: false },
  { name: 'Trellis AI', website: 'https://www.trellis.ai', category: 'ai-coding', isDomestic: false },
  { name: 'Fine', website: 'https://fine.dev', category: 'ai-coding', isDomestic: false },
  { name: 'Supabase AI', website: 'https://supabase.com', category: 'ai-coding', isDomestic: false },
  { name: 'PlanetScale AI', website: 'https://planetscale.com', category: 'ai-coding', isDomestic: false },
  { name: 'Neon AI', website: 'https://neon.tech', category: 'ai-coding', isDomestic: false },
  { name: 'Turso', website: 'https://turso.tech', category: 'ai-coding', isDomestic: false },
  { name: 'Applitools', website: 'https://applitools.com', category: 'ai-coding', isDomestic: false },
  { name: 'Testim', website: 'https://www.testim.io', category: 'ai-coding', isDomestic: false },
  { name: 'Mabl', website: 'https://www.mabl.com', category: 'ai-coding', isDomestic: false },
  { name: 'Functionize', website: 'https://www.functionize.com', category: 'ai-coding', isDomestic: false },
  { name: 'Perfecto', website: 'https://www.perfecto.io', category: 'ai-coding', isDomestic: false },
  { name: 'Kobiton', website: 'https://kobiton.com', category: 'ai-coding', isDomestic: false },
  { name: 'Sauce Labs', website: 'https://saucelabs.com', category: 'ai-coding', isDomestic: false },
  { name: 'BrowserStack', website: 'https://www.browserstack.com', category: 'ai-coding', isDomestic: false },
  { name: 'LambdaTest', website: 'https://www.lambdatest.com', category: 'ai-coding', isDomestic: false },
  
  // 更多国内AI工具
  { name: '零一万物', website: 'https://www.lingyiwanwu.com', category: 'ai-chat', isDomestic: true },
  { name: '面壁智能', website: 'https://www.modelbest.cn', category: 'ai-chat', isDomestic: true },
  { name: '澜舟科技', website: 'https://www.langboat.com', category: 'ai-chat', isDomestic: true },
  { name: '浪潮信息', website: 'https://www.inspur.com', category: 'ai-chat', isDomestic: true },
  { name: '拓尔思', website: 'https://www.trs.com.cn', category: 'ai-writing', isDomestic: true },
  { name: '汉王科技', website: 'https://www.hanwang.com.cn', category: 'ai-writing', isDomestic: true },
  { name: '金山办公AI', website: 'https://www.wps.cn', category: 'ai-office', isDomestic: true },
  { name: '中科曙光', website: 'https://www.sugon.com', category: 'ai-coding', isDomestic: true },
  { name: '寒武纪', website: 'https://www.cambricon.com', category: 'ai-coding', isDomestic: true },
  { name: '地平线', website: 'https://www.horizon.ai', category: 'ai-coding', isDomestic: true },
  
  // AI图像处理
  { name: 'Topaz Labs', website: 'https://www.topazlabs.com', category: 'ai-painting', isDomestic: false },
  { name: 'Let\'s Enhance', website: 'https://letsenhance.io', category: 'ai-painting', isDomestic: false },
  { name: 'Icons8 Smart Upscaler', website: 'https://icons8.com/upscaler', category: 'ai-painting', isDomestic: false },
  { name: 'VanceAI', website: 'https://vanceai.com', category: 'ai-painting', isDomestic: false },
  { name: 'Zyro AI', website: 'https://zyro.com', category: 'ai-painting', isDomestic: false },
  { name: 'Slazzer', website: 'https://www.slazzer.com', category: 'ai-painting', isDomestic: false },
  { name: 'RemoveBG', website: 'https://www.remove.bg', category: 'ai-painting', isDomestic: false },
  { name: 'Unscreen', website: 'https://www.unscreen.com', category: 'ai-video', isDomestic: false },
  { name: 'Cleanup.pictures', website: 'https://cleanup.pictures', category: 'ai-painting', isDomestic: false },
  { name: 'Magic Eraser', website: 'https://magicstudio.com/magiceraser', category: 'ai-painting', isDomestic: false },
  
  // AI营销工具
  { name: 'Phrasee', website: 'https://www.phrasee.co', category: 'ai-writing', isDomestic: false },
  { name: 'Persado', website: 'https://www.persado.com', category: 'ai-writing', isDomestic: false },
  { name: 'CopySmith', website: 'https://copysmith.ai', category: 'ai-writing', isDomestic: false },
  { name: 'Headlime', website: 'https://headlime.com', category: 'ai-writing', isDomestic: false },
  { name: 'Zopy', website: 'https://zopy.io', category: 'ai-writing', isDomestic: false },
  { name: 'Writecream', website: 'https://www.writecream.com', category: 'ai-writing', isDomestic: false },
  { name: 'Peppertype.ai', website: 'https://www.peppertype.ai', category: 'ai-writing', isDomestic: false },
  { name: 'ContentBot', website: 'https://contentbot.ai', category: 'ai-writing', isDomestic: false },
  { name: 'MarketingCopy AI', website: 'https://marketingcopy.ai', category: 'ai-writing', isDomestic: false },
  { name: 'CopyHero', website: 'https://copyhero.io', category: 'ai-writing', isDomestic: false },
  
  // AI创意工具
  { name: 'Maze', website: 'https://maze.co', category: 'ai-office', isDomestic: false },
  { name: 'UserTesting AI', website: 'https://www.usertesting.com', category: 'ai-office', isDomestic: false },
  { name: 'Lookback', website: 'https://lookback.io', category: 'ai-office', isDomestic: false },
  { name: 'Dovetail', website: 'https://dovetail.com', category: 'ai-office', isDomestic: false },
  { name: 'Notably', website: 'https://notably.ai', category: 'ai-office', isDomestic: false },
  { name: 'Condens', website: 'https://condens.io', category: 'ai-office', isDomestic: false },
  { name: 'EnjoyHQ', website: 'https://enjoyhq.io', category: 'ai-office', isDomestic: false },
  { name: 'Reframer', website: 'https://reframer.io', category: 'ai-office', isDomestic: false },
  { name: 'Awario', website: 'https://awario.io', category: 'ai-office', isDomestic: false },
  { name: 'Mentionlytics', website: 'https://www.mentionlytics.com', category: 'ai-office', isDomestic: false },
  
  // AI开发平台
  { name: 'Anyscale', website: 'https://www.anyscale.com', category: 'ai-coding', isDomestic: false },
  { name: 'Modal', website: 'https://modal.com', category: 'ai-coding', isDomestic: false },
  { name: 'Beam', website: 'https://beam.cloud', category: 'ai-coding', isDomestic: false },
  { name: 'RunPod', website: 'https://www.runpod.io', category: 'ai-coding', isDomestic: false },
  { name: 'Jarvis Labs', website: 'https://jarvislabs.ai', category: 'ai-coding', isDomestic: false },
  { name: 'Lambda Labs', website: 'https://lambdalabs.com', category: 'ai-coding', isDomestic: false },
  { name: 'CoreWeave', website: 'https://www.coreweave.com', category: 'ai-coding', isDomestic: false },
  { name: 'Vast.ai', website: 'https://vast.ai', category: 'ai-coding', isDomestic: false },
  { name: 'Paperspace', website: 'https://paperspace.com', category: 'ai-coding', isDomestic: false },
  { name: 'Gradient', website: 'https://gradient.ai', category: 'ai-coding', isDomestic: false },
  
  // AI金融工具
  { name: 'Kensho', website: 'https://www.kensho.com', category: 'ai-office', isDomestic: false },
  { name: 'AlphaSense', website: 'https://www.alpha-sense.com', category: 'ai-office', isDomestic: false },
  { name: 'Sentifi', website: 'https://www.sentifi.com', category: 'ai-office', isDomestic: false },
  { name: 'FinChat', website: 'https://finchat.io', category: 'ai-chat', isDomestic: false },
  { name: 'Tickeron', website: 'https://tickeron.com', category: 'ai-office', isDomestic: false },
  { name: 'Trade Ideas', website: 'https://www.trade-ideas.com', category: 'ai-office', isDomestic: false },
  { name: 'TrendSpider', website: 'https://trendspider.com', category: 'ai-office', isDomestic: false },
  { name: 'EquBot', website: 'https://www.equibot.ai', category: 'ai-office', isDomestic: false },
  { name: 'Kavout', website: 'https://www.kavout.com', category: 'ai-office', isDomestic: false },
  { name: 'Numerai', website: 'https://numer.ai', category: 'ai-office', isDomestic: false },
]

/**
 * 补充AI工具（达到500个）
 */
export async function POST(request: Request) {
  try {
    const client = getSupabaseClient()
    
    // 获取分类映射
    const { data: categories } = await client
      .from('categories')
      .select('id, slug')
    
    const categoryMap = new Map(
      (categories || []).map(c => [c.slug, c.id])
    )
    
    // 获取管理员用户作为发布者
    const { data: adminUser } = await client
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .limit(1)
      .single()
    
    const publisherId = adminUser?.id || '5b3927c8-fcfa-4ede-bd8b-9e856e4e1a53'

    // 打乱顺序
    const shuffledTools = [...additionalTools].sort(() => Math.random() - 0.5)

    // 准备插入数据
    const toolsToInsert = shuffledTools.map(tool => {
      const categoryId = categoryMap.get(tool.category) || 1
      const slug = tool.name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '') + '-' + Math.random().toString(36).substring(2, 6)
      
      return {
        name: tool.name,
        slug: slug,
        description: `${tool.name}是一款${tool.isDomestic ? '国内' : '国外'}优秀的AI工具`,
        website: tool.website,
        logo: `https://icons.duckduckgo.com/ip3/${new URL(tool.website).hostname}.ico`,
        category_id: categoryId,
        publisher_id: publisherId,
        status: 'approved',
        is_free: Math.random() > 0.3,
        view_count: Math.floor(Math.random() * 10000),
        favorite_count: Math.floor(Math.random() * 1000),
      }
    })

    // 批量插入
    const { data, error } = await client
      .from('ai_tools')
      .insert(toolsToInsert)
      .select('id, name')

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        inserted: data?.length || 0,
        tools: data?.slice(0, 10).map(t => t.name),
      }
    })
  } catch (error) {
    console.error('批量插入工具错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
