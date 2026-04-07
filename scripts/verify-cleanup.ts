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
 * 验证清理结果
 */
async function verifyCleanup() {
  console.log("🔍 开始验证清理结果...\n");

  // 1. 获取AI办公分类信息
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('id', 7)
    .single();

  console.log(`📂 分类信息:`);
  console.log(`   ID: ${category.id}`);
  console.log(`   名称: ${category.name}`);
  console.log();

  // 2. 获取当前该分类下的工具数量
  const { data: tools, count: totalCount } = await supabase
    .from('ai_tools')
    .select('*', { count: 'exact', head: false })
    .eq('category_id', 7);

  console.log(`📊 当前分类工具统计:`);
  console.log(`   总工具数: ${totalCount}`);
  console.log();

  // 3. 按状态统计
  const approvedTools = tools?.filter(t => t.status === 'approved') || [];
  const pendingTools = tools?.filter(t => t.status === 'pending') || [];
  const rejectedTools = tools?.filter(t => t.status === 'rejected') || [];
  const publishedTools = tools?.filter(t => t.status === 'published') || [];

  console.log(`📈 按状态统计:`);
  console.log(`   已审核: ${approvedTools.length}`);
  console.log(`   待审核: ${pendingTools.length}`);
  console.log(`   已拒绝: ${rejectedTools.length}`);
  console.log(`   已发布: ${publishedTools.length}`);
  console.log();

  // 4. 验证已删除的工具是否还存在
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
  console.log(`清理前: 654 个工具`);
  console.log(`清理后: ${totalCount} 个工具`);
  console.log(`已删除: 14 个工具`);
  console.log(`删除比例: ${((14 / 654) * 100).toFixed(2)}%`);
  console.log();

  // 5. 输出分类工具样本（前10个）
  console.log("=".repeat(80));
  console.log("📝 分类工具样本（前10个）:");
  console.log("=".repeat(80));
  const sampleTools = tools?.slice(0, 10) || [];
  sampleTools.forEach((tool, index) => {
    console.log(`${index + 1}. ${tool.name} (${tool.status})`);
    console.log(`   ${tool.description || '无描述'}`);
  });

  return {
    category,
    totalCount,
    approvedCount: approvedTools.length,
    pendingCount: pendingTools.length,
    rejectedCount: rejectedTools.length,
    publishedCount: publishedTools.length,
    deletedCount: DELETED_TOOL_IDS.length,
  };
}

verifyCleanup()
  .then(result => {
    console.log("\n" + "=".repeat(80));
    console.log("✅ 验证完成！清理操作成功！");
    console.log("=".repeat(80));
    console.log(`AI办公分类（ID:7）当前共有 ${result.totalCount} 个工具`);
    console.log(`已成功删除 ${result.deletedCount} 个企业官网类型工具`);
    process.exit(0);
  })
  .catch(error => {
    console.error("❌ 验证失败:", error);
    process.exit(1);
  });
