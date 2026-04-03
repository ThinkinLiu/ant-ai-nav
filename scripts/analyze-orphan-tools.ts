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

async function analyzeOrphanTools() {
  console.log("🔍 检查孤儿工具（分类ID异常）...\n");

  // 1. 获取所有工具
  const { data: tools, error: toolsError } = await supabase
    .from('ai_tools')
    .select('id, name, category_id, status')
    .order('category_id', { ascending: true });

  if (toolsError) {
    console.error("❌ 获取工具失败:", toolsError);
    process.exit(1);
  }

  console.log(`总工具数: ${tools.length}`);

  // 2. 按分类ID分组统计
  const byCategory = new Map<number, any[]>();
  const toolsWithNullCategory: any[] = [];
  const toolsWithInvalidCategory: any[] = [];

  tools.forEach(tool => {
    if (tool.category_id === null) {
      toolsWithNullCategory.push(tool);
    } else if (tool.category_id === undefined) {
      toolsWithInvalidCategory.push(tool);
    } else if (typeof tool.category_id !== 'number') {
      toolsWithInvalidCategory.push(tool);
    } else {
      const list = byCategory.get(tool.category_id) || [];
      list.push(tool);
      byCategory.set(tool.category_id, list);
    }
  });

  console.log("\n" + "=".repeat(80));
  console.log("按分类ID统计:");
  console.log("=".repeat(80));

  const sortedCategoryIds = Array.from(byCategory.keys()).sort((a, b) => a - b);
  sortedCategoryIds.forEach(catId => {
    const catTools = byCategory.get(catId)!;
    const approved = catTools.filter(t => t.status === 'approved').length;
    const pending = catTools.filter(t => t.status === 'pending').length;
    const rejected = catTools.filter(t => t.status === 'rejected').length;
    console.log(`分类ID ${catId}: ${catTools.length} 个工具 (已审核: ${approved}, 待审核: ${pending}, 已拒绝: ${rejected})`);
  });

  if (toolsWithNullCategory.length > 0) {
    console.log("\n" + "=".repeat(80));
    console.log("⚠️  category_id 为 null 的工具:");
    console.log("=".repeat(80));
    toolsWithNullCategory.forEach(tool => {
      console.log(`- ${tool.name} (ID: ${tool.id}, status: ${tool.status})`);
    });
  }

  if (toolsWithInvalidCategory.length > 0) {
    console.log("\n" + "=".repeat(80));
    console.log("⚠️  category_id 无效的工具:");
    console.log("=".repeat(80));
    toolsWithInvalidCategory.forEach(tool => {
      console.log(`- ${tool.name} (ID: ${tool.id}, category_id: ${tool.category_id}, status: ${tool.status})`);
    });
  }

  // 3. 检查分类 4-8 是否真的有工具
  console.log("\n" + "=".repeat(80));
  console.log("检查分类 4-8 的工具:");
  console.log("=".repeat(80));

  for (let i = 4; i <= 8; i++) {
    const catTools = byCategory.get(i) || [];
    console.log(`\n分类ID ${i}: ${catTools.length} 个工具`);
    if (catTools.length > 0) {
      catTools.slice(0, 5).forEach(tool => {
        console.log(`  - ${tool.name} (ID: ${tool.id}, status: ${tool.status})`);
      });
      if (catTools.length > 5) {
        console.log(`  ... 还有 ${catTools.length - 5} 个工具`);
      }
    }
  }
}

analyzeOrphanTools()
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
