import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://br-giddy-crow-97a8b86c.supabase2.aidap-global.cn-beijing.volces.com';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjMzNTM3MTM5NDMsInJvbGUiOiJhbm9uIn0.n0YDj3Gjz3xKmcrcc8j_IxnO2VgSkkI4_6tU5q52sO0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTools() {
  console.log("🔍 检查工具是否已存在于数据库...\n");

  const toolsData = JSON.parse(fs.readFileSync('/tmp/verified-march-2026-tools.json', 'utf-8'));
  const tools = toolsData.tools;

  const results = [];

  for (const tool of tools) {
    try {
      const slug = tool.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      const { data, error } = await supabase
        .from('ai_tools')
        .select('id, name, slug')
        .eq('slug', slug)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 是没有找到结果
        console.error(`❌ 检查 ${tool.name} 失败:`, error);
        results.push({
          name: tool.name,
          status: 'error',
          message: error.message
        });
        continue;
      }

      if (data) {
        console.log(`⚠️  ${tool.name} - 已存在 (ID: ${data.id})`);
        results.push({
          name: tool.name,
          status: 'exists',
          existing_id: data.id,
          message: '已存在于数据库'
        });
      } else {
        console.log(`✅ ${tool.name} - 未收录`);
        results.push({
          name: tool.name,
          status: 'not_found',
          message: '未收录'
        });
      }
    } catch (error: any) {
      console.error(`❌ 检查 ${tool.name} 失败:`, error);
      results.push({
        name: tool.name,
        status: 'error',
        message: error.message
      });
    }
  }

  console.log("\n" + "=".repeat(80));
  console.log("检查结果统计：");
  console.log("=".repeat(80));

  const notFound = results.filter(r => r.status === 'not_found');
  const exists = results.filter(r => r.status === 'exists');
  const errors = results.filter(r => r.status === 'error');

  console.log(`\n✅ 未收录: ${notFound.length} 个`);
  console.log(`⚠️  已存在: ${exists.length} 个`);
  console.log(`❌ 错误: ${errors.length} 个`);

  // 输出未收录的工具
  if (notFound.length > 0) {
    console.log("\n" + "=".repeat(80));
    console.log("待添加工具列表：");
    console.log("=".repeat(80));

    notFound.forEach((result, index) => {
      const tool = tools.find(t => t.name === result.name);
      console.log(`\n${index + 1}. ${tool.name}`);
      console.log(`   官网: ${tool.website}`);
      console.log(`   分类: ${tool.category}`);
      console.log(`   发布日期: ${tool.release_date}`);
      console.log(`   描述: ${tool.description.substring(0, 100)}...`);
      console.log(`   来源: ${tool.source}`);
      console.log(`   验证: ${tool.verification}`);
    });
  }

  // 输出已存在的工具
  if (exists.length > 0) {
    console.log("\n" + "=".repeat(80));
    console.log("已存在工具（将跳过）：");
    console.log("=".repeat(80));

    exists.forEach((result, index) => {
      console.log(`${index + 1}. ${result.name} (ID: ${result.existing_id})`);
    });
  }

  return {
    not_found: notFound,
    exists: exists,
    errors: errors
  };
}

checkTools().then(results => {
  console.log("\n" + "=".repeat(80));
  console.log("检查完成！");
  console.log("=".repeat(80));

  process.exit(0);
}).catch(error => {
  console.error("❌ 检查失败:", error);
  process.exit(1);
});
