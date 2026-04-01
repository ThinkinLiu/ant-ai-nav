/**
 * Supabase 连接测试脚本
 * 用于验证环境变量配置是否正确
 * 
 * 运行方式：pnpm tsx scripts/test-supabase-connection.ts
 */

import { createClient } from '@supabase/supabase-js';

// 从环境变量读取配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.COZE_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.COZE_SUPABASE_ANON_KEY || '';

console.log('🔍 检查 Supabase 配置...\n');

// 检查环境变量
if (!supabaseUrl) {
  console.error('❌ 错误: 未找到 NEXT_PUBLIC_SUPABASE_URL 环境变量');
  console.log('\n📝 请在 .env.local 文件中添加以下配置：');
  console.log('NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here');
  process.exit(1);
}

if (!supabaseKey) {
  console.error('❌ 错误: 未找到 NEXT_PUBLIC_SUPABASE_ANON_KEY 环境变量');
  console.log('\n📝 请在 .env.local 文件中添加以下配置：');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here');
  process.exit(1);
}

console.log('✅ 环境变量已配置');
console.log(`   URL: ${supabaseUrl}`);
console.log(`   Key: ${supabaseKey.substring(0, 20)}...`);

// 测试连接
async function testConnection() {
  console.log('\n🔌 测试数据库连接...');
  
  try {
    const supabase = createClient(supabaseUrl!, supabaseKey!);
    
    // 测试查询 - 获取分类列表
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug')
      .limit(5);
    
    if (error) {
      console.error('❌ 连接失败:', error.message);
      console.log('\n可能的原因：');
      console.log('1. Supabase URL 或 Key 不正确');
      console.log('2. 数据库表尚未创建（请先运行 database/00_schema.sql）');
      console.log('3. 网络连接问题');
      process.exit(1);
    }
    
    console.log('✅ 连接成功！');
    console.log(`\n📊 数据库中的分类（共 ${data?.length || 0} 个）：`);
    data?.forEach(cat => {
      console.log(`   - ${cat.name} (${cat.slug})`);
    });
    
    console.log('\n🎉 Supabase 配置正确，可以开始使用了！');
    
  } catch (err) {
    console.error('❌ 连接异常:', err);
    process.exit(1);
  }
}

testConnection();
