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

async function testAPI() {
  console.log("🔍 测试 API 数据统计...\n");

  // 测试 /api/admin/categories
  console.log("测试 /api/admin/categories API:");
  try {
    const response = await fetch('http://localhost:5000/api/admin/categories');
    const data = await response.json();

    if (data.success) {
      const totalTools = data.data.reduce((sum: number, cat: any) => sum + (cat.toolCount || 0), 0);
      console.log(`✅ 成功获取 ${data.data.length} 个分类`);
      console.log(`📊 API 统计总工具数: ${totalTools}`);
      console.log("\n分类统计:");

      data.data.forEach((cat: any) => {
        const icon = cat.icon || '📦';
        console.log(`  ${icon} ${cat.name}: ${cat.toolCount} 个工具`);
      });
    } else {
      console.error(`❌ API 错误: ${data.error}`);
    }
  } catch (error) {
    console.error(`❌ 请求失败: ${error}`);
  }

  console.log("\n" + "=".repeat(80) + "\n");

  // 测试 /api/home
  console.log("测试 /api/home API:");
  try {
    const response = await fetch('http://localhost:5000/api/home');
    const data = await response.json();

    if (data.success) {
      const totalTools = data.data.categories.reduce((sum: number, cat: any) => sum + (cat.toolCount || 0), 0);
      console.log(`✅ 成功获取 ${data.data.categories.length} 个分类`);
      console.log(`📊 API 统计总工具数: ${totalTools}`);
      console.log("\n分类统计:");

      data.data.categories.forEach((cat: any) => {
        const icon = cat.icon || '📦';
        console.log(`  ${icon} ${cat.name}: ${cat.toolCount} 个工具`);
      });
    } else {
      console.error(`❌ API 错误: ${data.error}`);
    }
  } catch (error) {
    console.error(`❌ 请求失败: ${error}`);
  }

  console.log("\n" + "=".repeat(80) + "\n");

  // 数据库查询对比
  console.log("数据库实际统计（用于对比）:");
  const { count: totalCount } = await supabase
    .from('ai_tools')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved');

  console.log(`✅ 数据库总工具数: ${totalCount}`);

  // 按分类统计
  for (let i = 1; i <= 8; i++) {
    const { count } = await supabase
      .from('ai_tools')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')
      .eq('category_id', i);

    console.log(`  分类 ${i}: ${count} 个工具`);
  }
}

testAPI()
  .then(() => {
    console.log("\n" + "=".repeat(80));
    console.log("测试完成！");
    console.log("=".repeat(80));
    process.exit(0);
  })
  .catch(error => {
    console.error("❌ 测试失败:", error);
    process.exit(1);
  });
