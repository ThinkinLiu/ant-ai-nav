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

async function checkRecentlyAddedTools() {
  console.log("🔍 检查最近添加的工具...\n");

  // 获取最近添加的工具
  const { data: recentTools, error } = await supabase
    .from('ai_tools')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error("❌ 获取失败:", error);
    process.exit(1);
  }

  console.log(`最近添加的 ${recentTools.length} 个工具:\n`);

  recentTools.forEach((tool, index) => {
    console.log(`${index + 1}. ${tool.name}`);
    console.log(`   Slug: ${tool.slug}`);
    console.log(`   分类ID: ${tool.category_id}`);
    console.log(`   状态: ${tool.status}`);
    console.log(`   创建时间: ${tool.created_at}`);
    console.log();
  });

  // 统计每个分类的工具数量（不限制状态）
  console.log("=".repeat(80));
  console.log("按分类统计（所有状态）:");
  console.log("=".repeat(80));

  const { data: allTools } = await supabase
    .from('ai_tools')
    .select('category_id, status');

  if (allTools) {
    const categoryStats = new Map<number, { total: number, approved: number, pending: number }>();

    allTools.forEach(tool => {
      const stats = categoryStats.get(tool.category_id) || { total: 0, approved: 0, pending: 0 };
      stats.total++;
      if (tool.status === 'approved') stats.approved++;
      if (tool.status === 'pending') stats.pending++;
      categoryStats.set(tool.category_id, stats);
    });

    categoryStats.forEach((stats, catId) => {
      console.log(`分类ID ${catId}: 总计 ${stats.total} 个 (已审核: ${stats.approved}, 待审核: ${stats.pending})`);
    });
  }
}

checkRecentlyAddedTools()
  .then(() => {
    console.log("\n" + "=".repeat(80));
    console.log("检查完成！");
    console.log("=".repeat(80));
    process.exit(0);
  })
  .catch(error => {
    console.error("❌ 检查失败:", error);
    process.exit(1);
  });
