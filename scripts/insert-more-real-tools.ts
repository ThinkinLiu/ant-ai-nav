/**
 * 插入更多真实的国内AI工具 - 扩展版
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.COZE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.COZE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);
const ADMIN_ID = '5b3927c8-fcfa-4ede-bd8b-9e856e4e1a53';

const CATEGORY_MAP: Record<string, number> = {
  'ai-writing': 1, 'ai-painting': 2, 'ai-chat': 3, 'ai-coding': 4,
  'ai-audio': 5, 'ai-video': 6, 'ai-office': 7, 'ai-learning': 8,
};

// 更多真实的国内AI工具
const moreRealTools = [
  // ===== AI写作 - 更多真实工具 =====
  { name: 'Notion AI', website: 'https://www.notion.so/product/ai', category: 'ai-writing', description: 'Notion AI写作助手，支持文档生成、翻译和总结', isFree: true, pricing: '基础功能免费' },
  { name: 'Writesonic中文', website: 'https://writesonic.com', category: 'ai-writing', description: 'AI文案写作和营销内容生成', isFree: true, pricing: '基础功能免费' },
  { name: 'Jasper中文', website: 'https://www.jasper.ai', category: 'ai-writing', description: 'AI营销内容创作平台', isFree: false, pricing: '会员制' },
  { name: 'Copy.ai中文版', website: 'https://www.copy.ai', category: 'ai-writing', description: 'AI营销文案生成工具', isFree: true, pricing: '基础功能免费' },
  { name: 'Rytr', website: 'https://rytr.me', category: 'ai-writing', description: 'AI写作助手，支持多种语言', isFree: true, pricing: '基础功能免费' },
  { name: 'Sudowrite', website: 'https://www.sudowrite.com', category: 'ai-writing', description: 'AI小说和创意写作工具', isFree: false, pricing: '会员制' },
  { name: 'NovelAI', website: 'https://novelai.net', category: 'ai-writing', description: 'AI故事和小说生成平台', isFree: false, pricing: '会员制' },
  { name: 'Dreamily', website: 'https://dreamily.ai', category: 'ai-writing', description: 'AI创意写作工具', isFree: true, pricing: '基础功能免费' },
  { name: 'Smodin', website: 'https://smodin.io', category: 'ai-writing', description: 'AI写作和改写工具', isFree: true, pricing: '基础功能免费' },
  { name: 'Wordtune', website: 'https://www.wordtune.com', category: 'ai-writing', description: 'AI文本改写和润色工具', isFree: true, pricing: '基础功能免费' },
  { name: 'QuillBot', website: 'https://quillbot.com', category: 'ai-writing', description: 'AI改写和总结工具', isFree: true, pricing: '基础功能免费' },
  { name: 'Grammarly中文', website: 'https://www.grammarly.com', category: 'ai-writing', description: 'AI语法检查和写作助手', isFree: true, pricing: '基础功能免费' },
  { name: 'ProWritingAid', website: 'https://prowritingaid.com', category: 'ai-writing', description: 'AI写作分析和优化工具', isFree: true, pricing: '基础功能免费' },
  { name: 'Hemingway', website: 'https://hemingwayapp.com', category: 'ai-writing', description: 'AI写作风格优化工具', isFree: true, pricing: '免费使用' },
  { name: 'CopySmith', website: 'https://copysmith.ai', category: 'ai-writing', description: 'AI电商文案生成', isFree: false, pricing: '会员制' },
  { name: 'Anyword', website: 'https://anyword.com', category: 'ai-writing', description: 'AI营销文案优化工具', isFree: true, pricing: '基础功能免费' },
  { name: 'Copyscape', website: 'https://www.copyscape.com', category: 'ai-writing', description: 'AI内容原创性检测', isFree: true, pricing: '基础功能免费' },
  { name: 'Article Forge', website: 'https://www.articleforge.com', category: 'ai-writing', description: 'AI文章自动生成', isFree: false, pricing: '会员制' },
  { name: 'ContentBot', website: 'https://contentbot.ai', category: 'ai-writing', description: 'AI内容营销平台', isFree: true, pricing: '基础功能免费' },
  { name: 'TextCortex', website: 'https://textcortex.com', category: 'ai-writing', description: 'AI写作和营销内容', isFree: true, pricing: '基础功能免费' },
  
  // ===== AI绘画 - 更多真实工具 =====
  { name: 'DALL-E 3', website: 'https://openai.com/dall-e-3', category: 'ai-painting', description: 'OpenAI图像生成模型', isFree: false, pricing: '按量付费' },
  { name: 'Leonardo AI', website: 'https://leonardo.ai', category: 'ai-painting', description: 'AI游戏素材和艺术生成', isFree: true, pricing: '基础功能免费' },
  { name: 'Playground AI', website: 'https://playground.com', category: 'ai-painting', description: 'AI图像生成和编辑', isFree: true, pricing: '基础功能免费' },
  { name: 'Ideogram', website: 'https://ideogram.ai', category: 'ai-painting', description: 'AI图像生成，擅长文字', isFree: true, pricing: '基础功能免费' },
  { name: 'NightCafe', website: 'https://creator.nightcafe.studio', category: 'ai-painting', description: 'AI艺术创作平台', isFree: true, pricing: '基础功能免费' },
  { name: 'Stable Diffusion', website: 'https://stability.ai', category: 'ai-painting', description: '开源AI图像生成模型', isFree: true, pricing: '开源免费' },
  { name: 'Civitai', website: 'https://civitai.com', category: 'ai-painting', description: 'AI模型分享社区', isFree: true, pricing: '社区免费' },
  { name: 'Tensor.art', website: 'https://tensor.art', category: 'ai-painting', description: 'AI图像生成和模型托管', isFree: true, pricing: '基础功能免费' },
  { name: 'SeaArt', website: 'https://www.seaart.ai', category: 'ai-painting', description: 'AI绘画社区平台', isFree: true, pricing: '基础功能免费' },
  { name: 'Yodayo', website: 'https://yodayo.com', category: 'ai-painting', description: 'AI动漫图像生成', isFree: true, pricing: '基础功能免费' },
  { name: 'PixAI', website: 'https://pixai.art', category: 'ai-painting', description: 'AI动漫艺术生成', isFree: true, pricing: '基础功能免费' },
  { name: 'NovelAI Diffusion', website: 'https://novelai.net/image', category: 'ai-painting', description: 'AI动漫图像生成', isFree: false, pricing: '会员制' },
  { name: 'Waifu Diffusion', website: 'https://github.com/harubaru/waifu-diffusion', category: 'ai-painting', description: '动漫风格AI绘图', isFree: true, pricing: '开源免费' },
  { name: 'Krea AI', website: 'https://www.krea.ai', category: 'ai-painting', description: 'AI实时图像生成', isFree: true, pricing: '基础功能免费' },
  { name: 'Clipdrop', website: 'https://clipdrop.co', category: 'ai-painting', description: 'AI图像处理工具集', isFree: true, pricing: '基础功能免费' },
  { name: 'Photoroom', website: 'https://www.photoroom.com', category: 'ai-painting', description: 'AI产品图片编辑', isFree: true, pricing: '基础功能免费' },
  { name: 'Remove.bg', website: 'https://www.remove.bg', category: 'ai-painting', description: 'AI自动抠图工具', isFree: true, pricing: '基础功能免费' },
  { name: 'Slazzer', website: 'https://www.slazzer.com', category: 'ai-painting', description: 'AI背景移除工具', isFree: true, pricing: '基础功能免费' },
  { name: 'Unscreen', website: 'https://www.unscreen.com', category: 'ai-painting', description: 'AI视频背景移除', isFree: true, pricing: '基础功能免费' },
  { name: 'Palette.fm', website: 'https://palette.fm', category: 'ai-painting', description: 'AI照片上色工具', isFree: true, pricing: '基础功能免费' },
  
  // ===== AI对话 - 更多真实工具 =====
  { name: 'ChatGPT', website: 'https://chat.openai.com', category: 'ai-chat', description: 'OpenAI大语言模型对话', isFree: true, pricing: '基础功能免费' },
  { name: 'Claude', website: 'https://claude.ai', category: 'ai-chat', description: 'Anthropic AI助手', isFree: true, pricing: '基础功能免费' },
  { name: 'Perplexity', website: 'https://www.perplexity.ai', category: 'ai-chat', description: 'AI搜索引擎', isFree: true, pricing: '基础功能免费' },
  { name: 'Poe', website: 'https://poe.com', category: 'ai-chat', description: '多模型AI聊天平台', isFree: true, pricing: '基础功能免费' },
  { name: 'Character.AI', website: 'https://character.ai', category: 'ai-chat', description: 'AI角色对话平台', isFree: true, pricing: '免费使用' },
  { name: 'Chai', website: 'https://www.chai-research.com', category: 'ai-chat', description: 'AI聊天机器人平台', isFree: true, pricing: '基础功能免费' },
  { name: 'Replika', website: 'https://replika.ai', category: 'ai-chat', description: 'AI情感陪伴聊天', isFree: true, pricing: '基础功能免费' },
  { name: 'You.com', website: 'https://you.com', category: 'ai-chat', description: 'AI搜索引擎和对话', isFree: true, pricing: '基础功能免费' },
  { name: 'Phind', website: 'https://www.phind.com', category: 'ai-chat', description: 'AI开发者搜索引擎', isFree: true, pricing: '免费使用' },
  { name: 'HuggingChat', website: 'https://huggingface.co/chat', category: 'ai-chat', description: '开源AI对话平台', isFree: true, pricing: '免费使用' },
  { name: 'Mistral AI', website: 'https://chat.mistral.ai', category: 'ai-chat', description: 'Mistral AI助手', isFree: true, pricing: '基础功能免费' },
  { name: 'Groq', website: 'https://groq.com', category: 'ai-chat', description: '高速AI推理平台', isFree: true, pricing: '基础功能免费' },
  { name: 'Cohere', website: 'https://cohere.com', category: 'ai-chat', description: '企业AI对话平台', isFree: false, pricing: '企业服务' },
  { name: 'Inflection AI', website: 'https://inflection.ai', category: 'ai-chat', description: 'Pi AI助手', isFree: true, pricing: '免费使用' },
  { name: 'Adept AI', website: 'https://www.adept.ai', category: 'ai-chat', description: 'AI行动助手', isFree: false, pricing: '企业服务' },
  
  // ===== AI编程 - 更多真实工具 =====
  { name: 'GitHub Copilot', website: 'https://github.com/features/copilot', category: 'ai-coding', description: 'GitHub AI编程助手', isFree: false, pricing: '订阅制' },
  { name: 'Cursor', website: 'https://cursor.sh', category: 'ai-coding', description: 'AI编程编辑器', isFree: true, pricing: '基础功能免费' },
  { name: 'Replit', website: 'https://replit.com', category: 'ai-coding', description: '在线AI编程环境', isFree: true, pricing: '基础功能免费' },
  { name: 'Tabnine', website: 'https://www.tabnine.com', category: 'ai-coding', description: 'AI代码补全工具', isFree: true, pricing: '基础功能免费' },
  { name: 'Sourcegraph Cody', website: 'https://sourcegraph.com/cody', category: 'ai-coding', description: 'AI代码助手', isFree: true, pricing: '基础功能免费' },
  { name: 'Amazon CodeWhisperer', website: 'https://aws.amazon.com/codewhisperer', category: 'ai-coding', description: 'AWS AI编程助手', isFree: true, pricing: '免费使用' },
  { name: 'JetBrains AI', website: 'https://www.jetbrains.com/ai', category: 'ai-coding', description: 'JetBrains AI助手', isFree: false, pricing: '订阅制' },
  { name: 'Codeium', website: 'https://codeium.com', category: 'ai-coding', description: '免费AI代码补全', isFree: true, pricing: '免费使用' },
  { name: 'Mutable.ai', website: 'https://mutable.ai', category: 'ai-coding', description: 'AI软件开发平台', isFree: true, pricing: '基础功能免费' },
  { name: 'Safurai', website: 'https://www.safurai.com', category: 'ai-coding', description: 'AI编码助手', isFree: true, pricing: '基础功能免费' },
  { name: 'AskCodi', website: 'https://www.askcodi.com', category: 'ai-coding', description: 'AI编程问答助手', isFree: true, pricing: '基础功能免费' },
  { name: 'Pieces for Developers', website: 'https://pieces.app', category: 'ai-coding', description: 'AI代码管理工具', isFree: true, pricing: '免费使用' },
  { name: 'Blackbox AI', website: 'https://www.blackbox.ai', category: 'ai-coding', description: 'AI代码生成和搜索', isFree: true, pricing: '基础功能免费' },
  { name: 'Codium AI', website: 'https://www.codium.ai', category: 'ai-coding', description: 'AI测试生成', isFree: true, pricing: '基础功能免费' },
  { name: 'Smol Developer', website: 'https://github.com/smol-ai/developer', category: 'ai-coding', description: 'AI开发者代理', isFree: true, pricing: '开源免费' },
  
  // ===== AI音频 - 更多真实工具 =====
  { name: 'ElevenLabs', website: 'https://elevenlabs.io', category: 'ai-audio', description: 'AI语音合成和克隆', isFree: true, pricing: '基础功能免费' },
  { name: 'Murf AI', website: 'https://murf.ai', category: 'ai-audio', description: 'AI配音生成', isFree: true, pricing: '基础功能免费' },
  { name: 'Play.ht', website: 'https://play.ht', category: 'ai-audio', description: 'AI语音合成平台', isFree: true, pricing: '基础功能免费' },
  { name: 'Resemble AI', website: 'https://www.resemble.ai', category: 'ai-audio', description: 'AI语音克隆', isFree: true, pricing: '基础功能免费' },
  { name: 'Lovo AI', website: 'https://lovo.ai', category: 'ai-audio', description: 'AI配音和语音生成', isFree: true, pricing: '基础功能免费' },
  { name: 'Synthesia', website: 'https://www.synthesia.io', category: 'ai-audio', description: 'AI视频配音', isFree: false, pricing: '企业服务' },
  { name: 'Descript', website: 'https://www.descript.com', category: 'ai-audio', description: 'AI音频编辑工具', isFree: true, pricing: '基础功能免费' },
  { name: 'Adobe Podcast', website: 'https://podcast.adobe.com', category: 'ai-audio', description: 'AI播客制作', isFree: true, pricing: '免费使用' },
  { name: 'Auphonic', website: 'https://auphonic.com', category: 'ai-audio', description: 'AI音频后期处理', isFree: true, pricing: '基础功能免费' },
  { name: 'Cleanvoice', website: 'https://cleanvoice.ai', category: 'ai-audio', description: 'AI音频清理工具', isFree: true, pricing: '基础功能免费' },
  { name: 'Suno AI', website: 'https://suno.ai', category: 'ai-audio', description: 'AI音乐生成', isFree: true, pricing: '基础功能免费' },
  { name: 'Udio', website: 'https://www.udio.com', category: 'ai-audio', description: 'AI音乐创作平台', isFree: true, pricing: '基础功能免费' },
  { name: 'AIVA', website: 'https://www.aiva.ai', category: 'ai-audio', description: 'AI作曲工具', isFree: true, pricing: '基础功能免费' },
  { name: 'Soundraw', website: 'https://soundraw.io', category: 'ai-audio', description: 'AI音乐生成器', isFree: true, pricing: '基础功能免费' },
  { name: 'Boomy', website: 'https://boomy.com', category: 'ai-audio', description: 'AI音乐创作', isFree: true, pricing: '基础功能免费' },
  
  // ===== AI视频 - 更多真实工具 =====
  { name: 'Runway', website: 'https://runwayml.com', category: 'ai-video', description: 'AI视频生成和编辑', isFree: true, pricing: '基础功能免费' },
  { name: 'Pika Labs', website: 'https://pika.art', category: 'ai-video', description: 'AI视频生成', isFree: true, pricing: '基础功能免费' },
  { name: 'Sora', website: 'https://openai.com/sora', category: 'ai-video', description: 'OpenAI视频生成模型', isFree: false, pricing: '即将开放' },
  { name: 'HeyGen', website: 'https://www.heygen.com', category: 'ai-video', description: 'AI数字人视频', isFree: true, pricing: '基础功能免费' },
  { name: 'D-ID', website: 'https://www.d-id.com', category: 'ai-video', description: 'AI数字人制作', isFree: true, pricing: '基础功能免费' },
  { name: 'Synthesia', website: 'https://www.synthesia.io', category: 'ai-video', description: 'AI视频制作平台', isFree: false, pricing: '企业服务' },
  { name: 'Pictory', website: 'https://pictory.ai', category: 'ai-video', description: 'AI视频创作', isFree: true, pricing: '基础功能免费' },
  { name: 'InVideo AI', website: 'https://invideo.io', category: 'ai-video', description: 'AI视频编辑', isFree: true, pricing: '基础功能免费' },
  { name: 'Opus Clip', website: 'https://opus.pro', category: 'ai-video', description: 'AI短视频剪辑', isFree: true, pricing: '基础功能免费' },
  { name: 'Veed.io', website: 'https://www.veed.io', category: 'ai-video', description: '在线AI视频编辑', isFree: true, pricing: '基础功能免费' },
  { name: 'Lumen5', website: 'https://lumen5.com', category: 'ai-video', description: 'AI视频营销工具', isFree: true, pricing: '基础功能免费' },
  { name: 'Descript', website: 'https://www.descript.com', category: 'ai-video', description: 'AI视频和音频编辑', isFree: true, pricing: '基础功能免费' },
  { name: 'Fliki', website: 'https://fliki.ai', category: 'ai-video', description: 'AI文字转视频', isFree: true, pricing: '基础功能免费' },
  { name: 'Steve AI', website: 'https://www.steve.ai', category: 'ai-video', description: 'AI动画视频制作', isFree: true, pricing: '基础功能免费' },
  { name: 'Synths Video', website: 'https://synths.video', category: 'ai-video', description: 'AI视频生成', isFree: true, pricing: '基础功能免费' },
  
  // ===== AI办公 - 更多真实工具 =====
  { name: 'Otter.ai', website: 'https://otter.ai', category: 'ai-office', description: 'AI会议转录', isFree: true, pricing: '基础功能免费' },
  { name: 'Fireflies.ai', website: 'https://fireflies.ai', category: 'ai-office', description: 'AI会议记录', isFree: true, pricing: '基础功能免费' },
  { name: 'tl;dv', website: 'https://tldv.io', category: 'ai-office', description: 'AI会议总结', isFree: true, pricing: '基础功能免费' },
  { name: 'Avoma', website: 'https://www.avoma.com', category: 'ai-office', description: 'AI会议助手', isFree: true, pricing: '基础功能免费' },
  { name: 'Airgram', website: 'https://airgram.io', category: 'ai-office', description: 'AI会议记录', isFree: true, pricing: '基础功能免费' },
  { name: 'Krisp', website: 'https://krisp.ai', category: 'ai-office', description: 'AI降噪工具', isFree: true, pricing: '基础功能免费' },
  { name: 'tl;draw', website: 'https://makereal.tldraw.com', category: 'ai-office', description: 'AI白板工具', isFree: true, pricing: '免费使用' },
  { name: 'Excalidraw', website: 'https://excalidraw.com', category: 'ai-office', description: 'AI手绘白板', isFree: true, pricing: '免费使用' },
  { name: 'Miro AI', website: 'https://miro.com/ai', category: 'ai-office', description: 'AI协作白板', isFree: true, pricing: '基础功能免费' },
  { name: 'Lucidchart AI', website: 'https://www.lucidchart.com', category: 'ai-office', description: 'AI流程图工具', isFree: true, pricing: '基础功能免费' },
  { name: 'Gamma AI', website: 'https://gamma.app', category: 'ai-office', description: 'AI演示文稿生成', isFree: true, pricing: '基础功能免费' },
  { name: 'Beautiful.ai', website: 'https://www.beautiful.ai', category: 'ai-office', description: 'AI PPT设计', isFree: false, pricing: '订阅制' },
  { name: 'Tome', website: 'https://tome.app', category: 'ai-office', description: 'AI演示文稿', isFree: true, pricing: '基础功能免费' },
  { name: 'Pitch', website: 'https://pitch.com', category: 'ai-office', description: 'AI协作演示', isFree: true, pricing: '基础功能免费' },
  { name: 'SlidesAI', website: 'https://www.slidesai.io', category: 'ai-office', description: 'AI幻灯片生成', isFree: true, pricing: '基础功能免费' },
  
  // ===== AI学习 - 更多真实工具 =====
  { name: 'Duolingo', website: 'https://www.duolingo.com', category: 'ai-learning', description: 'AI语言学习应用', isFree: true, pricing: '基础功能免费' },
  { name: 'Elsa Speak', website: 'https://elsaspeak.com', category: 'ai-learning', description: 'AI英语口语教练', isFree: true, pricing: '基础功能免费' },
  { name: 'Speak', website: 'https://www.speak.com', category: 'ai-learning', description: 'AI英语学习', isFree: true, pricing: '基础功能免费' },
  { name: 'Quizlet', website: 'https://quizlet.com', category: 'ai-learning', description: 'AI学习卡片', isFree: true, pricing: '基础功能免费' },
  { name: 'Anki', website: 'https://apps.ankiweb.net', category: 'ai-learning', description: 'AI间隔重复学习', isFree: true, pricing: '免费使用' },
  { name: 'Coursera', website: 'https://www.coursera.org', category: 'ai-learning', description: '在线课程平台', isFree: true, pricing: '部分免费' },
  { name: 'Khan Academy', website: 'https://www.khanacademy.org', category: 'ai-learning', description: '免费在线学习', isFree: true, pricing: '免费使用' },
  { name: 'edX', website: 'https://www.edx.org', category: 'ai-learning', description: '在线课程平台', isFree: true, pricing: '部分免费' },
  { name: 'Udemy', website: 'https://www.udemy.com', category: 'ai-learning', description: '在线技能学习', isFree: false, pricing: '课程收费' },
  { name: 'Brilliant', website: 'https://brilliant.org', category: 'ai-learning', description: 'AI数学和科学学习', isFree: true, pricing: '基础功能免费' },
  { name: 'Photomath', website: 'https://photomath.com', category: 'ai-learning', description: 'AI拍照解题', isFree: true, pricing: '基础功能免费' },
  { name: 'Socratic', website: 'https://socratic.org', category: 'ai-learning', description: '谷歌AI学习助手', isFree: true, pricing: '免费使用' },
  { name: 'Wolfram Alpha', website: 'https://www.wolframalpha.com', category: 'ai-learning', description: 'AI知识计算引擎', isFree: true, pricing: '基础功能免费' },
  { name: 'Grammarly Edu', website: 'https://www.grammarly.com/edu', category: 'ai-learning', description: 'AI写作学习工具', isFree: true, pricing: '基础功能免费' },
  { name: 'Turnitin', website: 'https://www.turnitin.com', category: 'ai-learning', description: 'AI学术检测', isFree: false, pricing: '机构服务' },
];

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

function generateSlug(name: string): string {
  const random = Math.random().toString(36).substring(2, 8);
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
  return `${cleanName}-${random}`;
}

async function main() {
  console.log('插入更多真实的AI工具...\n');
  
  // 获取已存在的工具
  const { data: existingTools } = await supabase.from('ai_tools').select('website, name');
  const existingWebsites = new Set(existingTools?.map(t => t.website.toLowerCase()) || []);
  const existingNames = new Set(existingTools?.map(t => t.name.toLowerCase()) || []);
  console.log(`数据库中已有 ${existingWebsites.size} 个工具\n`);
  
  // 过滤已存在的工具
  const newTools = moreRealTools.filter(tool => 
    !existingWebsites.has(tool.website.toLowerCase()) &&
    !existingNames.has(tool.name.toLowerCase())
  );
  
  console.log(`准备插入 ${newTools.length} 个新工具\n`);
  
  // 随机打乱顺序
  const shuffledTools = shuffleArray(newTools);
  
  // 批量插入
  const batchSize = 50;
  let inserted = 0;
  let failed = 0;
  
  for (let i = 0; i < shuffledTools.length; i += batchSize) {
    const batch = shuffledTools.slice(i, i + batchSize);
    
    const insertData = batch.map(tool => ({
      name: tool.name,
      slug: generateSlug(tool.name),
      description: tool.description,
      long_description: `${tool.name}是${tool.description}。该工具利用先进的人工智能技术，为用户提供高效便捷的服务体验。`,
      website: tool.website,
      logo: `https://icons.duckduckgo.com/ip3/${extractDomain(tool.website)}.ico`,
      category_id: CATEGORY_MAP[tool.category],
      publisher_id: ADMIN_ID,
      status: 'approved',
      is_featured: false,
      is_pinned: false,
      is_free: tool.isFree,
      pricing_info: tool.pricing,
      view_count: Math.floor(Math.random() * 1000) + 100,
      favorite_count: 0,
    }));
    
    const { error } = await supabase.from('ai_tools').insert(insertData);
    if (error) {
      console.error(`批次插入失败:`, error.message);
      failed += batch.length;
    } else {
      inserted += batch.length;
      console.log(`已插入 ${inserted}/${shuffledTools.length} 个工具...`);
    }
  }
  
  console.log(`\n完成! 成功: ${inserted}, 失败: ${failed}`);
  
  // 统计总数
  const { count } = await supabase.from('ai_tools').select('*', { count: 'exact', head: true });
  console.log(`数据库总工具数: ${count}`);
}

main().catch(console.error);
