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

async function analyzeCategories() {
  console.log("🔍 分析分类和工具数据...\n");

  // 1. 获取所有分类
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (categoriesError) {
    console.error("❌ 获取分类失败:", categoriesError);
    process.exit(1);
  }

  console.log("=".repeat(80));
  console.log("分类列表:");
  console.log("=".repeat(80));

  // 2. 获取所有工具
  const { data: tools, error: toolsError } = await supabase
    .from('ai_tools')
    .select('id, category_id, status')
    .eq('status', 'approved');

  if (toolsError) {
    console.error("❌ 获取工具失败:", toolsError);
    process.exit(1);
  }

  // 3. 统计每个分类的工具数量
  const categoryStats = categories.map(category => {
    const toolCount = tools.filter(tool => tool.category_id === category.id).length;
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      icon: category.icon,
      toolCount: toolCount,
      sortOrder: category.sortOrder
    };
  });

  // 4. 输出结果
  categoryStats.forEach(stat => {
    const icon = stat.icon || '📦';
    const status = stat.toolCount > 0 ? '✅' : '⭕';
    console.log(`${status} ${icon} ${stat.name} (${stat.slug})`);
    console.log(`   ID: ${stat.id}, 排序: ${stat.sortOrder}, 工具数: ${stat.toolCount}`);
    console.log();
  });

  // 5. 找出工具数为0的分类
  const emptyCategories = categoryStats.filter(stat => stat.toolCount === 0);
  const filledCategories = categoryStats.filter(stat => stat.toolCount > 0);

  console.log("=".repeat(80));
  console.log("统计结果:");
  console.log("=".repeat(80));
  console.log(`总分类数: ${categories.length}`);
  console.log(`有数据的分类: ${filledCategories.length}`);
  console.log(`无数据的分类: ${emptyCategories.length}`);
  console.log(`总工具数: ${tools.length}`);

  if (emptyCategories.length > 0) {
    console.log("\n" + "=".repeat(80));
    console.log("无数据的分类（需要添加工具）:");
    console.log("=".repeat(80));
    emptyCategories.forEach(cat => {
      console.log(`- ${cat.name} (${cat.slug}) - ID: ${cat.id}`);
    });
  }

  // 6. 检查是否有工具的分类ID不匹配
  const toolCategoryIds = new Set(tools.map(t => t.category_id));
  const categoryIds = new Set(categories.map(c => c.id));
  const invalidCategoryIds = [...toolCategoryIds].filter(id => !categoryIds.has(id));

  if (invalidCategoryIds.length > 0) {
    console.log("\n" + "=".repeat(80));
    console.log("⚠️  警告: 发现工具使用了不存在的分类ID:");
    console.log("=".repeat(80));
    invalidCategoryIds.forEach(id => {
      const count = tools.filter(t => t.category_id === id).length;
      console.log(`- 分类ID ${id}: ${count} 个工具`);
    });
  }

  return {
    categories: categoryStats,
    emptyCategories,
    filledCategories,
    totalTools: tools.length
  };
}

analyzeCategories()
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
