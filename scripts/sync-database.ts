#!/usr/bin/env tsx

/**
 * 蚂蚁AI导航 - 数据库同步脚本
 * 
 * 用途: 在部署时自动同步数据库结构
 * 使用: tsx scripts/sync-database.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color: keyof typeof colors, message: string) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 获取环境变量
function getEnvVar(names: string[]): string | undefined {
  for (const name of names) {
    const value = process.env[name];
    if (value) return value;
  }
  return undefined;
}

// 主函数
async function main() {
  log('cyan', '==========================================');
  log('cyan', '蚂蚁AI导航 - 数据库同步');
  log('cyan', '==========================================');
  console.log();

  // 检查环境变量
  const supabaseUrl = getEnvVar(['NEXT_PUBLIC_SUPABASE_URL', 'COZE_SUPABASE_URL', 'SUPABASE_URL']);
  const supabaseKey = getEnvVar([
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'COZE_SUPABASE_ANON_KEY',
    'SUPABASE_ANON_KEY'
  ]);

  if (!supabaseUrl || !supabaseKey) {
    log('red', '❌ 错误: 缺少 Supabase 配置');
    console.log();
    console.log('请设置以下环境变量:');
    console.log('  - NEXT_PUBLIC_SUPABASE_URL 或 COZE_SUPABASE_URL');
    console.log('  - SUPABASE_SERVICE_ROLE_KEY (推荐) 或 NEXT_PUBLIC_SUPABASE_ANON_KEY');
    console.log();
    console.log('注意: 数据库同步需要 service_role 权限，请使用 Service Role Key');
    console.log('您可以在 Supabase 控制台 -> Settings -> API 中找到它');
    process.exit(1);
  }

  log('blue', '📋 Supabase 配置:');
  console.log(`  URL: ${supabaseUrl.substring(0, 50)}...`);
  console.log(`  Key: ${supabaseKey.substring(0, 20)}...`);
  console.log();

  // 创建 Supabase 客户端
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // 检查数据库连接
  log('blue', '🔍 检查数据库连接...');
  try {
    const { error } = await supabase.from('categories').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    log('green', '  ✅ 数据库连接成功');
  } catch (error: any) {
    log('red', `  ❌ 数据库连接失败: ${error.message}`);
    console.log();
    console.log('可能的原因:');
    console.log('  1. Supabase URL 或 Key 配置错误');
    console.log('  2. 网络连接问题');
    console.log('  3. 表不存在，需要先创建表结构');
    console.log();
    console.log('请手动执行数据库初始化:');
    console.log('  1. 连接到 Supabase SQL Editor');
    console.log('  2. 执行 database/00_schema.sql 创建表结构');
    console.log('  3. 执行其他 SQL 文件导入数据');
    process.exit(1);
  }

  // 检查表是否存在
  console.log();
  log('blue', '🔍 检查数据库表...');
  
  const tables = [
    'categories',
    'tags', 
    'users',
    'ai_tools',
    'ai_hall_of_fame',
    'ai_timeline',
    'comments',
    'favorites',
    'tool_tags'
  ];

  const tableStatus: Record<string, boolean> = {};
  
  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        tableStatus[table] = false;
        console.log(`  ❌ ${table}: 不存在`);
      } else {
        tableStatus[table] = true;
        console.log(`  ✅ ${table}: 存在 (${count} 条记录)`);
      }
    } catch {
      tableStatus[table] = false;
      console.log(`  ❌ ${table}: 检查失败`);
    }
  }

  // 检查是否需要初始化
  const missingTables = Object.entries(tableStatus)
    .filter(([_, exists]) => !exists)
    .map(([name]) => name);

  if (missingTables.length > 0) {
    console.log();
    log('yellow', '⚠️  检测到缺失的表:');
    missingTables.forEach(table => console.log(`  - ${table}`));
    console.log();
    log('yellow', '请手动执行数据库初始化:');
    console.log();
    console.log('方法一: 使用 Supabase SQL Editor');
    console.log('  1. 打开 Supabase 控制台 -> SQL Editor');
    console.log('  2. 创建新查询');
    console.log('  3. 复制 database/00_schema.sql 的内容并执行');
    console.log();
    console.log('方法二: 使用命令行');
    console.log('  1. 获取数据库连接字符串 (Supabase 控制台 -> Settings -> Database)');
    console.log('  2. 执行: psql <连接字符串> -f database/00_schema.sql');
    console.log();
    console.log('方法三: 使用 Supabase CLI');
    console.log('  supabase link --project-ref <project-id>');
    console.log('  supabase db push');
  } else {
    console.log();
    log('green', '✅ 所有表都已存在，数据库结构正常');
  }

  console.log();
  log('cyan', '==========================================');
  log('cyan', '数据库同步检查完成');
  log('cyan', '==========================================');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
