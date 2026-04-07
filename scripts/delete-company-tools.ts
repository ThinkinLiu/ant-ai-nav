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

// 需要删除的工具ID
const TOOL_IDS = [
  5821,   // Confluence Cloud - 云Wiki平台
  5830,   // Shopify Themes - 电商主题
  10673,  // 律商联讯 - 法律信息服务
  10686,  // 容联云 - 云通讯平台
  10877,  // 环信 - 即时通讯云服务
  11030,  // 领英中国 - 领英职场社交
  11194,  // 迪普科技 - 迪普科技网络安全
  11205,  // 任子行 - 任子行网络安全
  11218,  // 滴滴办公 - 滴滴企业办公平台
  11252,  // 安恒信息 - 安恒信息安全服务
  11344,  // 又拍云审核 - 又拍云内容审核
  11349,  // 华为内容安全 - 华为云内容审核
  11383,  // 阿里绿网 - 阿里云内容安全
  11457,  // 金山云审核 - 金山云内容审核
];

/**
 * 删除企业官网类型工具
 */
async function deleteCompanyTools() {
  console.log("🗑️  开始删除企业官网类型工具...\n");

  console.log(`📋 将删除 ${TOOL_IDS.length} 个工具`);
  console.log(`工具ID: ${TOOL_IDS.join(', ')}\n`);

  // 1. 先查询这些工具的信息，用于确认
  const { data: tools, error: fetchError } = await supabase
    .from('ai_tools')
    .select('*')
    .in('id', TOOL_IDS)
    .order('id', { ascending: true });

  if (fetchError) {
    console.error("❌ 查询工具失败:", fetchError);
    process.exit(1);
  }

  if (!tools || tools.length === 0) {
    console.log("⚠️  未找到要删除的工具");
    process.exit(0);
  }

  console.log("📝 将删除以下工具:");
  console.log("=".repeat(80));
  tools.forEach(tool => {
    console.log(`- ID: ${tool.id} | ${tool.name} | ${tool.description} | 状态: ${tool.status}`);
  });
  console.log("=".repeat(80));
  console.log();

  // 2. 确认删除（非交互式，直接删除）
  console.log("⚠️  准备删除这些工具...");

  // 3. 执行删除
  const { error: deleteError } = await supabase
    .from('ai_tools')
    .delete()
    .in('id', TOOL_IDS);

  if (deleteError) {
    console.error("❌ 删除失败:", deleteError);
    process.exit(1);
  }

  console.log("✅ 删除成功！\n");

  // 4. 验证删除结果
  const { data: remainingTools, error: verifyError } = await supabase
    .from('ai_tools')
    .select('id')
    .in('id', TOOL_IDS);

  if (verifyError) {
    console.error("❌ 验证失败:", verifyError);
  } else if (remainingTools && remainingTools.length > 0) {
    console.warn(`⚠️  警告: 还有 ${remainingTools.length} 个工具未被删除`);
    console.warn(`剩余工具ID: ${remainingTools.map(t => t.id).join(', ')}`);
  } else {
    console.log("✅ 验证通过: 所有工具已成功删除");
  }

  console.log();
  console.log("=".repeat(80));
  console.log("📊 清理完成统计:");
  console.log("=".repeat(80));
  console.log(`计划删除: ${TOOL_IDS.length} 个工具`);
  console.log(`实际删除: ${tools.length} 个工具`);
  console.log(`剩余工具: ${remainingTools ? remainingTools.length : 0} 个`);
  console.log();

  return {
    planned: TOOL_IDS.length,
    deleted: tools.length,
    remaining: remainingTools ? remainingTools.length : 0,
  };
}

deleteCompanyTools()
  .then(result => {
    console.log("=".repeat(80));
    console.log("✅ 清理完成！");
    console.log("=".repeat(80));
    console.log(`已成功删除 ${result.deleted} 个企业官网类型工具`);
    process.exit(0);
  })
  .catch(error => {
    console.error("❌ 清理失败:", error);
    process.exit(1);
  });
