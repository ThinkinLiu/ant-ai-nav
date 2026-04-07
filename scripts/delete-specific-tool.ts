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

/**
 * 查询并删除指定工具
 */
async function deleteToolByName(name: string) {
  console.log(`🔍 查询工具: ${name}\n`);

  // 1. 查询工具
  const { data: tools, error: fetchError } = await supabase
    .from('ai_tools')
    .select('*')
    .ilike('name', `%${name}%`);

  if (fetchError) {
    console.error("❌ 查询失败:", fetchError);
    process.exit(1);
  }

  if (!tools || tools.length === 0) {
    console.log(`⚠️  未找到名称包含"${name}"的工具`);
    process.exit(0);
  }

  console.log(`📋 找到 ${tools.length} 个工具:`);
  console.log("=".repeat(80));
  tools.forEach(tool => {
    console.log(`- ID: ${tool.id}`);
    console.log(`  名称: ${tool.name}`);
    console.log(`  描述: ${tool.description || '无'}`);
    console.log(`  分类: ${tool.category_id}`);
    console.log(`  状态: ${tool.status}`);
    console.log();
  });
  console.log("=".repeat(80));
  console.log();

  // 2. 删除所有匹配的工具
  const toolIds = tools.map(t => t.id);
  console.log(`🗑️  准备删除 ${toolIds.length} 个工具...`);

  const { error: deleteError } = await supabase
    .from('ai_tools')
    .delete()
    .in('id', toolIds);

  if (deleteError) {
    console.error("❌ 删除失败:", deleteError);
    process.exit(1);
  }

  console.log("✅ 删除成功！\n");

  // 3. 验证删除
  const { data: remainingTools } = await supabase
    .from('ai_tools')
    .select('id')
    .in('id', toolIds);

  if (remainingTools && remainingTools.length > 0) {
    console.warn(`⚠️  警告: 还有 ${remainingTools.length} 个工具未被删除`);
  } else {
    console.log("✅ 验证通过: 所有工具已成功删除");
  }

  console.log();
  console.log("=".repeat(80));
  console.log("📊 删除完成:");
  console.log("=".repeat(80));
  console.log(`删除的工具: ${tools.map(t => t.name).join(', ')}`);
  console.log(`工具ID: ${toolIds.join(', ')}`);

  return {
    deletedCount: tools.length,
    tools: tools.map(t => ({ id: t.id, name: t.name })),
  };
}

deleteToolByName('肯耐珂萨')
  .then(result => {
    console.log("\n" + "=".repeat(80));
    console.log("✅ 操作完成！");
    console.log("=".repeat(80));
    console.log(`已删除 ${result.deletedCount} 个工具`);
    process.exit(0);
  })
  .catch(error => {
    console.error("❌ 操作失败:", error);
    process.exit(1);
  });
