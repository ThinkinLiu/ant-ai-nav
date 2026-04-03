import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// 加载环境变量
dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ 错误: 缺少 Supabase 环境变量");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 真实的 AI 工具数据
const toolsToAdd = [
  // AI编程工具 (ID: 4)
  { name: 'GitHub Copilot', website: 'https://github.com/features/copilot', category_id: 4, description: 'GitHub 和 OpenAI 合作开发的 AI 编程助手，提供智能代码补全', is_free: false },
  { name: 'Cursor', website: 'https://cursor.sh', category_id: 4, description: '基于 AI 的代码编辑器，提供智能代码生成和调试功能', is_free: true },
  { name: 'Replit', website: 'https://replit.com', category_id: 4, description: '在线编程平台，内置 AI 编程助手和智能调试功能', is_free: true },
  { name: 'Codeium', website: 'https://codeium.com', category_id: 4, description: '免费的 AI 编程助手，支持多种编程语言', is_free: true },
  { name: 'Tabnine', website: 'https://tabnine.com', category_id: 4, description: 'AI 驱动的代码补全工具，支持私有模型训练', is_free: false },
  { name: 'Amazon CodeWhisperer', website: 'https://aws.amazon.com/codewhisperer', category_id: 4, description: '亚马逊推出的 AI 编程助手，与 AWS 集成良好', is_free: true },
  { name: 'JetBrains AI', website: 'https://www.jetbrains.com/ai', category_id: 4, description: 'JetBrains 集成开发环境的 AI 编程助手', is_free: false },
  { name: 'Sourcegraph Cody', website: 'https://sourcegraph.com/cody', category_id: 4, description: '基于 AI 的代码搜索和生成工具', is_free: true },
  { name: 'Bito', website: 'https://bito.ai', category_id: 4, description: 'AI 编程助手，支持代码生成和解释', is_free: true },
  { name: 'CodeGeeX', website: 'https://codegeex.cn', category_id: 4, description: '清华大学开发的 AI 编程助手', is_free: true },
  { name: 'CodeLlama', website: 'https://llama.meta.com/llama2', category_id: 4, description: 'Meta 发布的 AI 编程大模型', is_free: true },
  { name: 'StarCoder', website: 'https://bigcode.huggingface.co/blog/starcode', category_id: 4, description: 'BigCode 项目开发的 AI 编程模型', is_free: true },
  { name: 'Poe', website: 'https://poe.com', category_id: 4, description: 'Quora 推出的 AI 编程和对话平台', is_free: true },
  { name: 'Phind', website: 'https://phind.com', category_id: 4, description: '专注于编程的 AI 搜索引擎', is_free: true },
  { name: 'MutableAI', website: 'https://mutable.ai', category_id: 4, description: 'AI 驱动的代码重构和优化工具', is_free: false },

  // AI音频工具 (ID: 5)
  { name: 'ElevenLabs', website: 'https://elevenlabs.io', category_id: 5, description: '最先进的 AI 语音合成平台，支持多语言克隆', is_free: false },
  { name: 'OpenAI Whisper', website: 'https://openai.com/research/whisper', category_id: 5, description: 'OpenAI 推出的强大语音识别模型', is_free: true },
  { name: 'Play.ht', website: 'https://play.ht', category_id: 5, description: 'AI 语音生成平台，支持自然语音克隆', is_free: true },
  { name: 'Murf AI', website: 'https://murf.ai', category_id: 5, description: '专业的 AI 语音生成和配音工具', is_free: false },
  { name: 'Suno AI', website: 'https://suno.ai', category_id: 5, description: 'AI 音乐生成平台，只需文字即可创作歌曲', is_free: true },
  { name: 'Stable Audio', website: 'https://stability.ai/stable-audio', category_id: 5, description: 'Stability AI 推出的音频生成模型', is_free: true },
  { name: 'Voicemod', website: 'https://www.voicemod.net', category_id: 5, description: 'AI 实时变声和语音修改工具', is_free: false },
  { name: 'Adobe Podcast', website: 'https://podcast.adobe.com', category_id: 5, description: 'Adobe 推出的 AI 语音增强和生成工具', is_free: true },
  { name: 'Lovo AI', website: 'https://lovo.ai', category_id: 5, description: 'AI 语音生成平台，提供专业级配音', is_free: false },
  { name: 'Resemble AI', website: 'https://www.resemble.ai', category_id: 5, description: 'AI 语音克隆和合成平台', is_free: false },
  { name: 'Aiva', website: 'https://www.aiva.ai', category_id: 5, description: 'AI 音乐创作平台，支持多种音乐风格', is_free: false },
  { name: 'Soundraw', website: 'https://soundraw.io', category_id: 5, description: 'AI 音乐生成工具，可自定义音乐参数', is_free: false },
  { name: 'Beatoven.ai', website: 'https://www.beatoven.ai', category_id: 5, description: 'AI 背景音乐生成平台', is_free: true },
  { name: 'Vocalremover', website: 'https://vocalremover.org', category_id: 5, description: 'AI 人声和伴奏分离工具', is_free: true },
  { name: 'Media.io', website: 'https://www.media.io', category_id: 5, description: '在线音频编辑和转换工具', is_free: true },

  // AI视频工具 (ID: 6)
  { name: 'Runway', website: 'https://runway.ml', category_id: 6, description: '领先的 AI 视频创作平台，支持文本生成视频', is_free: false },
  { name: 'Pika Labs', website: 'https://pika.art', category_id: 6, description: 'AI 视频生成平台，可将图片转为视频', is_free: true },
  { name: 'HeyGen', website: 'https://www.heygen.com', category_id: 6, description: 'AI 数字人生成和视频创作工具', is_free: false },
  { name: 'Synthesia', website: 'https://www.synthesia.io', category_id: 6, description: 'AI 虚拟人物视频生成平台', is_free: false },
  { name: 'D-ID', website: 'https://www.d-id.com', category_id: 6, description: 'AI 数字人生成和动画制作工具', is_free: false },
  { name: 'Pictory', website: 'https://pictory.ai', category_id: 6, description: 'AI 视频内容生成平台，可将文本转为视频', is_free: false },
  { name: 'Luma AI', website: 'https://lumalabs.ai', category_id: 6, description: 'AI 3D 视频生成和渲染平台', is_free: true },
  { name: 'Stable Video Diffusion', website: 'https://stability.ai/stable-video', category_id: 6, description: 'Stability AI 推出的视频生成模型', is_free: true },
  { name: 'Sora', website: 'https://openai.com/sora', category_id: 6, description: 'OpenAI 推出的文生视频 AI 模型', is_free: true },
  { name: 'Gen-2', website: 'https://research.runwayml.com/gen-2', category_id: 6, description: 'Runway 推出的 AI 视频生成模型', is_free: true },
  { name: 'Kaiber', website: 'https://kaiber.ai', category_id: 6, description: 'AI 音乐视频生成平台', is_free: false },
  { name: 'Unscreen', website: 'https://www.unscreen.com', category_id: 6, description: 'AI 视频背景移除工具', is_free: true },
  { name: 'Replicate', website: 'https://replicate.com', category_id: 6, description: 'AI 模型托管和运行平台，包含视频模型', is_free: true },
  { name: 'CapCut', website: 'https://www.capcut.com', category_id: 6, description: '剪映国际版，内置 AI 视频编辑功能', is_free: true },
  { name: 'FlexClip', website: 'https://www.flexclip.com', category_id: 6, description: '在线视频编辑器，支持 AI 文字转视频', is_free: true },

  // AI办公工具 (ID: 7)
  { name: 'Notion AI', website: 'https://notion.so', category_id: 7, description: 'Notion 内置的 AI 写作和内容生成助手', is_free: false },
  { name: 'ChatDOC', website: 'https://chatdoc.com', category_id: 7, description: 'AI 文档阅读和问答工具', is_free: true },
  { name: 'Gamma', website: 'https://gamma.app', category_id: 7, description: 'AI 幻灯片生成平台，一键创建演示文稿', is_free: true },
  { name: 'Beautiful.ai', website: 'https://beautiful.ai', category_id: 7, description: 'AI 智能幻灯片设计工具', is_free: false },
  { name: 'Tome', website: 'https://tome.app', category_id: 7, description: 'AI 演示文稿生成平台', is_free: true },
  { name: 'Grammarly', website: 'https://grammarly.com', category_id: 7, description: 'AI 语法检查和写作助手', is_free: true },
  { name: 'QuillBot', website: 'https://quillbot.com', category_id: 7, description: 'AI 文本改写和摘要工具', is_free: true },
  { name: 'Jasper', website: 'https://jasper.ai', category_id: 7, description: '专业的 AI 商业文案生成工具', is_free: false },
  { name: 'Copy.ai', website: 'https://copy.ai', category_id: 7, description: 'AI 营销文案生成工具', is_free: true },
  { name: 'Writesonic', website: 'https://writesonic.com', category_id: 7, description: 'AI 内容生成平台，支持多种文案类型', is_free: true },
  { name: 'Otter.ai', website: 'https://otter.ai', category_id: 7, description: 'AI 会议记录和转写工具', is_free: true },
  { name: 'Fireflies.ai', website: 'https://fireflies.ai', category_id: 7, description: 'AI 会议助手，自动记录和总结会议', is_free: true },
  { name: 'Loom', website: 'https://www.loom.com', category_id: 7, description: '屏幕录制和视频消息工具，内置 AI 摘要', is_free: true },
  { name: 'Todoist AI', website: 'https://todoist.com', category_id: 7, description: 'AI 任务管理助手', is_free: true },
  { name: 'Motion', website: 'https://www.usemotion.com', category_id: 7, description: 'AI 智能日程和任务管理工具', is_free: false },

  // AI学习工具 (ID: 8)
  { name: 'Khan Academy AI', website: 'https://khanacademy.org', category_id: 8, description: '可汗学院推出的 AI 学习助手', is_free: true },
  { name: 'Duolingo Max', website: 'https://duolingo.com', category_id: 8, description: '多邻国 AI 语言学习助手', is_free: true },
  { name: 'Socratic', website: 'https://socratic.org', category_id: 8, description: 'Google 推出的 AI 学习辅导工具', is_free: true },
  { name: 'Photomath', website: 'https://photomath.com', category_id: 8, description: 'AI 数学解题和学习工具', is_free: true },
  { name: 'Wolfram Alpha', website: 'https://wolframalpha.com', category_id: 8, description: 'AI 计算和知识问答引擎', is_free: true },
  { name: 'Perplexity', website: 'https://perplexity.ai', category_id: 8, description: 'AI 搜索和问答引擎', is_free: true },
  { name: 'Elicit', website: 'https://elicit.com', category_id: 8, description: 'AI 学术研究助手', is_free: true },
  { name: 'Consensus', website: 'https://consensus.app', category_id: 8, description: 'AI 学术论文搜索工具', is_free: true },
  { name: 'Semantic Scholar', website: 'https://semanticscholar.org', category_id: 8, description: 'AI 驱动的学术搜索引擎', is_free: true },
  { name: 'ChatPDF', website: 'https://chatpdf.com', category_id: 8, description: 'AI PDF 文档问答工具', is_free: true },
  { name: 'SciSpace', website: 'https://typeset.io', category_id: 8, description: 'AI 学术写作和研究工具', is_free: true },
  { name: 'Zotero', website: 'https://zotero.org', category_id: 8, description: '文献管理工具，支持 AI 摘要', is_free: true },
  { name: 'Mendeley', website: 'https://www.mendeley.com', category_id: 8, description: '学术文献管理和协作平台', is_free: true },
  { name: 'Coursera AI', website: 'https://coursera.org', category_id: 8, description: 'Coursera 课程推荐和学习助手', is_free: true },
  { name: 'edX AI', website: 'https://edx.org', category_id: 8, description: 'edX 在线课程平台，内置 AI 学习助手', is_free: true },
];

async function addToolsToEmptyCategories() {
  console.log("🔍 开始为空分类添加工具数据...\n");

  // 获取默认发布者 ID（第一个用户）
  const { data: publishers, error: publisherError } = await supabase
    .from('users')
    .select('id')
    .eq('role', 'admin')
    .limit(1);

  if (publisherError || !publishers || publishers.length === 0) {
    console.error("❌ 错误: 未找到管理员用户作为发布者");
    console.log("尝试使用普通用户...");

    const { data: regularUsers } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (!regularUsers || regularUsers.length === 0) {
      console.error("❌ 错误: 数据库中没有用户，无法添加工具");
      process.exit(1);
    }

    publishers = [regularUsers[0]];
  }

  const publisherId = publishers[0].id;
  console.log(`✅ 使用发布者 ID: ${publisherId}\n`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const tool of toolsToAdd) {
    try {
      // 生成 slug
      const slug = tool.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      // 检查是否已存在
      const { data: existing } = await supabase
        .from('ai_tools')
        .select('id')
        .eq('slug', slug)
        .single();

      if (existing) {
        console.log(`⚠️  跳过: ${tool.name} (已存在)`);
        skipCount++;
        continue;
      }

      // 插入工具
      const { error: insertError } = await supabase
        .from('ai_tools')
        .insert({
          name: tool.name,
          slug,
          description: tool.description,
          website: tool.website,
          category_id: tool.category_id,
          publisher_id: publisherId,
          status: 'approved',
          is_featured: false,
          is_free: tool.is_free,
          view_count: 0,
          favorite_count: 0,
        });

      if (insertError) {
        console.error(`❌ 失败: ${tool.name} - ${insertError.message}`);
        errorCount++;
      } else {
        console.log(`✅ 成功: ${tool.name}`);
        successCount++;
      }
    } catch (error: any) {
      console.error(`❌ 错误: ${tool.name} - ${error.message}`);
      errorCount++;
    }
  }

  console.log("\n" + "=".repeat(80));
  console.log("添加完成统计:");
  console.log("=".repeat(80));
  console.log(`✅ 成功添加: ${successCount} 个`);
  console.log(`⚠️  跳过 (已存在): ${skipCount} 个`);
  console.log(`❌ 失败: ${errorCount} 个`);
  console.log(`📊 总计处理: ${toolsToAdd.length} 个`);
}

addToolsToEmptyCategories()
  .then(() => {
    console.log("\n" + "=".repeat(80));
    console.log("操作完成！");
    console.log("=".repeat(80));
    process.exit(0);
  })
  .catch(error => {
    console.error("❌ 操作失败:", error);
    process.exit(1);
  });
