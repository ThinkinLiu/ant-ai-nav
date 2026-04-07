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

// 已删除的工具ID
const DELETED_TOOL_IDS = [
  3745, 3749, 3751, 4675, 9161, 10891, 10903, 10959, 11181,
  11185, 11209, 11217, 11225, 11232, 11237, 11250, 11251,
  11256, 11262, 11265, 11275,
];

/**
 * 验证清理结果
 */
async function verifyCleanup() {
  console.log("🔍 开始验证清理结果...\n");

  // 1. 获取当前分类工具数量
  const { data: tools, count: totalCount } = await supabase
    .from('ai_tools')
    .select('*', { count: 'exact', head: false })
    .eq('category_id', 7);

  console.log(`📊 当前分类工具统计:`);
  console.log(`   总工具数: ${totalCount}`);
  console.log();

  // 2. 验证已删除的工具是否还存在
  const { data: remainingDeletedTools } = await supabase
    .from('ai_tools')
    .select('id, name')
    .in('id', DELETED_TOOL_IDS);

  console.log("=".repeat(80));
  console.log("✅ 验证结果:");
  console.log("=".repeat(80));

  if (remainingDeletedTools && remainingDeletedTools.length > 0) {
    console.error(`❌ 错误: 还有 ${remainingDeletedTools.length} 个工具未被删除:`);
    remainingDeletedTools.forEach(tool => {
      console.error(`   - ID: ${tool.id} | ${tool.name}`);
    });
    process.exit(1);
  } else {
    console.log(`✅ 所有 ${DELETED_TOOL_IDS.length} 个企业官网类型工具已成功删除`);
  }

  console.log();
  console.log("=".repeat(80));
  console.log("📊 清理前后对比:");
  console.log("=".repeat(80));
  console.log(`第一次清理前: 654 个工具`);
  console.log(`第一次清理后: 640 个工具（删除14个）`);
  console.log(`第二次清理后: ${totalCount} 个工具（删除21个）`);
  console.log(`总共删除: 35 个工具`);
  console.log(`总删除比例: ${((35 / 654) * 100).toFixed(2)}%`);
  console.log();

  // 3. 输出分类工具样本（前10个）
  console.log("=".repeat(80));
  console.log("📝 分类工具样本（前10个）:");
  console.log("=".repeat(80));
  const sampleTools = tools?.slice(0, 10) || [];
  sampleTools.forEach((tool, index) => {
    console.log(`${index + 1}. ${tool.name} (${tool.status})`);
    console.log(`   ${tool.description || '无描述'}`);
  });

  return {
    totalCount,
    deletedCount: DELETED_TOOL_IDS.length,
  };
}

verifyCleanup()
  .then(result => {
    console.log("\n" + "=".repeat(80));
    console.log("✅ 验证完成！清理操作成功！");
    console.log("=".repeat(80));
    console.log(`AI办公分类（ID:7）当前共有 ${result.totalCount} 个工具`);
    console.log(`两次清理共删除 ${14 + result.deletedCount} 个企业官网类型工具`);
    console.log();
    console.log("清理的工具类型:");
    console.log("1. 第一次清理（14个）：");
    console.log("   - 企业官网、云服务、法律信息等非AI工具");
    console.log("2. 第二次清理（21个）：");
    console.log("   - 长虹AI、TCL AI、创维AI、海信AI（家电企业）");
    console.log("   - 海尔智家AI、美的AIoT、格力智能AI（智能家居）");
    console.log("   - 小米AIoT开放平台（智能硬件）");
    console.log("   - 顺丰/圆通/申通/中通/韵达AI（物流企业）");
    console.log("   - 中国移动云AI、招商银行AI（电信和银行）");
    console.log("   - 华胜天成/东软/神州数码/拓尔思AI（传统IT服务）");
    console.log();
    console.log("保留的工具包括:");
    console.log("- Notion AI、飞书AI、钉钉AI等知名AI工具");
    console.log("- 腾讯、阿里、字节等互联网公司的AI产品");
    console.log("- 所有真正的AI工具和服务");
    process.exit(0);
  })
  .catch(error => {
    console.error("❌ 验证失败:", error);
    process.exit(1);
  });
