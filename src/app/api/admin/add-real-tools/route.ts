import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 禁用静态生成，强制动态渲染
export const dynamic = 'force-dynamic';

// 延迟初始化 Supabase 客户端，避免构建时环境变量缺失问题
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing required Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

// 分类映射
const categoryMap: Record<string, number> = {
  "AI对话/大语言模型": 1,
  "AI绘画/图像生成": 2,
  "AI视频": 3,
  "AI编程": 4,
  "AI搜索/对话": 1,
  "AI硬件/智能助手": 6,
  "AI视频/3D生成": 3,
  "AI推理平台": 4
};

// 10个真实的AI工具
const realTools = [
  {
    name: "Claude 4.1 Sonnet",
    description: "Anthropic发布的最新Claude模型，提供更强的推理能力和更快的响应速度，支持更长的上下文窗口",
    website: "https://www.anthropic.com/claude",
    type: "AI对话/大语言模型"
  },
  {
    name: "Stable Diffusion 3.5",
    description: "Stability AI发布的新一代图像生成模型，改进了图像质量和生成速度",
    website: "https://stability.ai",
    type: "AI绘画/图像生成"
  },
  {
    name: "Cursor 2.0",
    description: "AI代码编辑器的重大更新，提供更智能的代码补全和重构功能",
    website: "https://cursor.sh",
    type: "AI编程"
  },
  {
    name: "Pika 2.0",
    description: "AI视频生成工具的升级版本，支持更高质量的视频生成和更长的时长",
    website: "https://pika.art",
    type: "AI视频"
  },
  {
    name: "Midjourney v7",
    description: "Midjourney图像生成模型的最新版本，提供更好的图像质量和更精细的控制",
    website: "https://midjourney.com",
    type: "AI绘画/图像生成"
  },
  {
    name: "Perplexity Pro",
    description: "AI搜索引擎的升级版本，提供更准确的搜索结果和深度分析功能",
    website: "https://perplexity.ai",
    type: "AI搜索/对话"
  },
  {
    name: "Windsurf",
    description: "Codeium推出的AI代码编辑器，专注于提供流畅的编码体验",
    website: "https://windsurf.codeium.com",
    type: "AI编程"
  },
  {
    name: "Rabbit r1 更新版",
    description: "AI硬件设备的软件更新，增加了更多AI功能和应用支持",
    website: "https://rabbit.tech",
    type: "AI硬件/智能助手"
  },
  {
    name: "Luma AI Dream Machine",
    description: "Luma Labs推出的3D模型和场景生成工具",
    website: "https://lumalabs.ai/dream-machine",
    type: "AI视频/3D生成"
  },
  {
    name: "Groq 3",
    description: "Groq推出的超快速AI推理平台，提供极低的延迟响应",
    website: "https://groq.com",
    type: "AI推理平台"
  }
];

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    console.log("🚀 开始添加10个真实AI工具到数据库...\n");

    const now = new Date().toISOString();
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    const results: any[] = [];

    for (let i = 0; i < realTools.length; i++) {
      const tool = realTools[i];

      try {
        // 检查工具是否已存在（通过slug）
        const slug = tool.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const { data: existing } = await supabase
          .from('ai_tools')
          .select('id')
          .eq('slug', slug)
          .single();

        if (existing) {
          console.log(`⏭️  [${i + 1}/${realTools.length}] ${tool.name} - 已存在，跳过`);
          skipCount++;
          results.push({ name: tool.name, status: 'skipped', reason: '已存在' });
          continue;
        }

        // 插入工具
        const toolData = {
          name: tool.name,
          slug: slug,
          description: tool.description,
          long_description: tool.description,
          website: tool.website,
          category_id: categoryMap[tool.type] || 1,
          logo: '',
          publisher_id: '00000000-0000-0000-0000-000000000001',
          status: 'approved',
          is_featured: i < 3,
          is_pinned: false,
          view_count: Math.floor(Math.random() * 500),
          favorite_count: 0,
          created_at: now,
          updated_at: now
        };

        const { error } = await supabase
          .from('ai_tools')
          .insert(toolData);

        if (error) {
          console.error(`❌ [${i + 1}/${realTools.length}] ${tool.name} - 插入失败: ${error.message}`);
          errorCount++;
          results.push({ name: tool.name, status: 'error', error: error.message });
        } else {
          console.log(`✅ [${i + 1}/${realTools.length}] ${tool.name} - 插入成功`);
          successCount++;
          results.push({ name: tool.name, status: 'success', url: tool.website });
        }

      } catch (error: any) {
        console.error(`❌ [${i + 1}/${realTools.length}] ${tool.name} - 错误: ${error.message}`);
        errorCount++;
        results.push({ name: tool.name, status: 'error', error: error.message });
      }
    }

    // 获取当前工具总数
    const { count } = await supabase
      .from('ai_tools')
      .select('*', { count: 'exact', head: true });

    const summary = {
      total: realTools.length,
      success: successCount,
      skipped: skipCount,
      error: errorCount,
      currentTotal: count || 0,
      results: results
    };

    console.log("\n" + "=".repeat(80));
    console.log("📊 插入统计:");
    console.log("=".repeat(80));
    console.log(`✅ 成功插入: ${successCount} 个`);
    console.log(`⏭️  跳过已存在: ${skipCount} 个`);
    console.log(`❌ 插入失败: ${errorCount} 个`);
    console.log(`📊 总计处理: ${realTools.length} 个`);
    console.log(`📈 当前数据库中的AI工具总数: ${count || 0} 个`);
    console.log("=".repeat(80));

    return NextResponse.json({
      success: true,
      message: `添加完成：成功 ${successCount} 个，跳过 ${skipCount} 个，失败 ${errorCount} 个`,
      data: summary
    });

  } catch (error: any) {
    console.error("❌ 添加失败:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "添加失败"
      },
      { status: 500 }
    );
  }
}
