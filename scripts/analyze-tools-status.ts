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

async function analyzeToolsByStatus() {
  console.log("🔍 分析工具状态分布...\n");

  // 1. 获取所有分类
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (categoriesError) {
    console.error("❌ 获取分类失败:", categoriesError);
    process.exit(1);
  }

  // 2. 获取所有工具
  const { data: tools, error: toolsError } = await supabase
    .from('ai_tools')
    .select('id, category_id, status, name')
    .order('category_id', { ascending: true });

  if (toolsError) {
    console.error("❌ 获取工具失败:", toolsError);
    process.exit(1);
  }

  // 3. 统计每个分类下各状态的工具数量
  const categoryStats = categories.map(category => {
    const categoryTools = tools.filter(tool => tool.category_id === category.id);
    const approvedCount = categoryTools.filter(t => t.status === 'approved').length;
    const pendingCount = categoryTools.filter(t => t.status === 'pending').length;
    const rejectedCount = categoryTools.filter(t => t.status === 'rejected').length;
    const totalCount = categoryTools.length;

    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      icon: category.icon,
      approvedCount,
      pendingCount,
      rejectedCount,
      totalCount
    };
  });

  // 4. 输出结果
  console.log("=".repeat(80));
  console.log("工具状态分布:");
  console.log("=".repeat(80));

  categoryStats.forEach(stat => {
    const icon = stat.icon || '📦';
    console.log(`${icon} ${stat.name} (${stat.slug})`);
    console.log(`   ID: ${stat.id}`);
    console.log(`   已审核: ${stat.approvedCount} | 待审核: ${stat.pendingCount} | 已拒绝: ${stat.rejectedCount} | 总计: ${stat.totalCount}`);
    console.log();
  });

  // 5. 检查是否有分类的 approved 工具数为 0
  const emptyApprovedCategories = categoryStats.filter(stat => stat.approvedCount === 0);
  const filledApprovedCategories = categoryStats.filter(stat => stat.approvedCount > 0);

  console.log("=".repeat(80));
  console.log("统计结果（基于已审核状态）:");
  console.log("=".repeat(80));
  console.log(`总分类数: ${categories.length}`);
  console.log(`有已审核工具的分类: ${filledApprovedCategories.length}`);
  console.log(`无已审核工具的分类: ${emptyApprovedCategories.length}`);

  // 按状态统计
  const totalApproved = tools.filter(t => t.status === 'approved').length;
  const totalPending = tools.filter(t => t.status === 'pending').length;
  const totalRejected = tools.filter(t => t.status === 'rejected').length;

  console.log(`\n总工具数: ${tools.length}`);
  console.log(`  - 已审核: ${totalApproved}`);
  console.log(`  - 待审核: ${totalPending}`);
  console.log(`  - 已拒绝: ${totalRejected}`);

  if (emptyApprovedCategories.length > 0) {
    console.log("\n" + "=".repeat(80));
    console.log("⚠️  无已审核工具的分类（前端显示为0）:");
    console.log("=".repeat(80));
    emptyApprovedCategories.forEach(cat => {
      console.log(`- ${cat.name} (${cat.slug}) - ID: ${cat.id}`);
      console.log(`  已审核: ${cat.approvedCount}, 待审核: ${cat.pendingCount}, 已拒绝: ${cat.rejectedCount}`);
    });
  }

  // 6. 找出有待审核工具但无已审核工具的分类
  const categoriesWithPendingOnly = emptyApprovedCategories.filter(cat => cat.pendingCount > 0);
  if (categoriesWithPendingOnly.length > 0) {
    console.log("\n" + "=".repeat(80));
    console.log("💡 建议：有以下分类有待审核工具，需要管理员审核:");
    console.log("=".repeat(80));
    categoriesWithPendingOnly.forEach(cat => {
      console.log(`- ${cat.name}: ${cat.pendingCount} 个待审核工具`);
      // 列出工具名称
      const pendingTools = tools.filter(t => t.category_id === cat.id && t.status === 'pending');
      pendingTools.forEach(tool => {
        console.log(`  - ${tool.name} (ID: ${tool.id})`);
      });
    });
  }

  return {
    categories: categoryStats,
    emptyApprovedCategories,
    filledApprovedCategories
  };
}

analyzeToolsByStatus()
  .then(result => {
    console.log("\n" + "=".repeat(80));
    console.log("分析完成！");
    console.log("=".repeat(80));
    process.exit(0);
  })
  .catch(error => {
    console.error("❌ 分析失败:", error);
    process.exit(1);
  });
