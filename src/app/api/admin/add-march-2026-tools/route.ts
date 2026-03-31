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
  "AI办公/自动化": 7,
  "AI硬件/智能设备": 6,
  "AI助手/本地化": 1,
  "AI硬件/智能家居": 6,
  "AI助手/个人助理": 1,
  "AI模型/嵌入模型": 4,
  "AI硬件/手机": 6,
  "AI框架/开发平台": 4,
  "AI工具/数据处理": 5,
  "AI硬件/移动设备": 6,
  "AI工具/运维": 4,
  "AI助手/语音助手": 1,
  "AI平台/品牌整合": 3,
  "AI模型/大语言模型": 1,
  "AI工具/产品管理": 7
};

// 15个真实的AI工具
const realTools = [
  {
    name: "Usercall Triggers",
    description: "AI语音调研自动化工具，通过Product Hunt发布，支持自动化语音访谈和分析",
    website: "https://usercall.ai",
    type: "AI办公/自动化"
  },
  {
    name: "千问AI眼镜",
    description: "阿里巴巴推出的AI智能眼镜，全面接入千问APP，支持语音交互和AI助手功能",
    website: "https://qwen.ai",
    type: "AI硬件/智能设备"
  },
  {
    name: "BoClaw",
    description: "博云发布的极简安装版个人AI助手，提供本地化AI能力",
    website: "https://boclaw.boycloud.cn",
    type: "AI助手/本地化"
  },
  {
    name: "小智云3.0",
    description: "2026年新品发布，全新AI智能家居系统升级，支持语音交互和智能场景联动",
    website: "https://xiaozhi.ai",
    type: "AI硬件/智能家居"
  },
  {
    name: "MuleRun AI",
    description: "个人AI助手重新定义工具，提供更智能的个人AI体验",
    website: "https://mulerun.ai",
    type: "AI助手/个人助理"
  },
  {
    name: "Google嵌入模型Gemini-2.5-Embed",
    description: "Google发布的划时代嵌入模型，大幅提升向量检索和语义理解能力",
    website: "https://ai.google.dev/gemini-api/docs/embeddings",
    type: "AI模型/嵌入模型"
  },
  {
    name: "三星Galaxy S26 AI",
    description: "三星Galaxy S26系列新品首发，更懂你的AI手机，集成Galaxy AI功能",
    website: "https://www.samsung.com",
    type: "AI硬件/手机"
  },
  {
    name: "苹果Core AI框架",
    description: "苹果在WWDC 2026推出的核心AI框架，从Core ML转型，开启生成式AI新篇章",
    website: "https://developer.apple.com",
    type: "AI框架/开发平台"
  },
  {
    name: "Stitch by Google",
    description: "Google推出的数据集成工具，支持AI驱动的数据处理和集成",
    website: "https://cloud.google.com/stitch",
    type: "AI工具/数据处理"
  },
  {
    name: "荣耀MWC 2026 AI系列",
    description: "在MWC 2026中，荣耀多款AI产品亮相，包括AI手机和AI平板",
    website: "https://www.honor.com",
    type: "AI硬件/移动设备"
  },
  {
    name: "华为智能运维运营AI",
    description: "华为发布的首个智能运维运营AI系统，提供自动化运维能力",
    website: "https://www.huawei.com",
    type: "AI工具/运维"
  },
  {
    name: "Siri Core AI升级",
    description: "Siri迎来大脑升级，苹果计划推出核心AI框架重塑开发者应用集成体验",
    website: "https://www.apple.com/siri",
    type: "AI助手/语音助手"
  },
  {
    name: "千问品牌统一",
    description: "阿里巴巴AI品牌统一为千问，整合旗下所有AI产品和服务",
    website: "https://qwen.aliyun.com",
    type: "AI平台/品牌整合"
  },
  {
    name: "GPT-5.4系列模型",
    description: "OpenAI发布的GPT-5.4系列模型，首个具备原生计算机操作能力的通用AI模型",
    website: "https://openai.com/gpt-5-4",
    type: "AI模型/大语言模型"
  },
  {
    name: "Z Product",
    description: "Product Hunt最佳产品之一，提供AI驱动的产品管理工具",
    website: "https://zproduct.app",
    type: "AI工具/产品管理"
  }
];

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    console.log("🚀 开始添加15个真实AI工具（2026年3月发布）到数据库...\n");

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
          is_featured: i < 5,
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
