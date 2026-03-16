#!/usr/bin/env tsx

/**
 * 蚂蚁AI导航 - 自动数据库同步模块
 * 
 * 用途: 在部署时自动同步数据库结构和初始数据
 * 使用: tsx scripts/auto-sync-database.ts
 * 
 * 环境变量:
 * - NEXT_PUBLIC_SUPABASE_URL / COZE_SUPABASE_URL: Supabase 项目 URL
 * - SUPABASE_SERVICE_ROLE_KEY: Service Role Key（必需，用于数据库管理）
 * - AUTO_SYNC_DATABASE: 设置为 'true' 启用自动同步（默认启用）
 * - SKIP_DB_SYNC: 设置为 'true' 跳过数据库同步
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
  dim: '\x1b[2m',
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

// Supabase 客户端
let supabaseAdmin: ReturnType<typeof createClient> | null = null;

function getSupabaseAdmin() {
  if (supabaseAdmin) return supabaseAdmin;
  
  const supabaseUrl = getEnvVar(['NEXT_PUBLIC_SUPABASE_URL', 'COZE_SUPABASE_URL', 'SUPABASE_URL']);
  const serviceRoleKey = getEnvVar(['SUPABASE_SERVICE_ROLE_KEY']);
  
  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }
  
  supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  
  return supabaseAdmin;
}

// 检查表是否存在
async function tableExists(tableName: string): Promise<boolean> {
  const admin = getSupabaseAdmin();
  if (!admin) return false;
  
  try {
    const { error } = await admin
      .from(tableName)
      .select('id')
      .limit(1);
    
    // 如果没有错误，或者错误不是表不存在，则表存在
    return !error || error.code !== 'PGRST116';
  } catch {
    return false;
  }
}

// 执行 SQL 文件
async function executeSqlFile(
  filePath: string,
  description: string
): Promise<{ success: boolean; message: string }> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return { success: false, message: 'Supabase admin client not initialized' };
  }
  
  try {
    const sql = fs.readFileSync(filePath, 'utf-8');
    
    // 使用 RPC 执行 SQL
    // 注意：需要在 Supabase 中创建这个 RPC 函数
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (admin as any).rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      // 如果 RPC 不存在，尝试其他方法
      if (error.message.includes('function') && error.message.includes('does not exist')) {
        return { 
          success: false, 
          message: 'RPC function exec_sql not found. Please create it in Supabase.' 
        };
      }
      throw error;
    }
    
    return { success: true, message: 'OK' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// 创建必要的 RPC 函数
async function setupRpcFunctions(): Promise<boolean> {
  const admin = getSupabaseAdmin();
  if (!admin) return false;
  
  // 这个函数需要在 Supabase SQL Editor 中手动创建
  // 因为 Supabase 客户端不能直接创建函数
  return false;
}

// 检查并创建表结构
async function syncTableStructure(): Promise<boolean> {
  log('blue', '\n📋 同步表结构...');
  
  const schemaFile = path.join(process.cwd(), 'database', '00_schema.sql');
  
  if (!fs.existsSync(schemaFile)) {
    log('yellow', '  ⚠️  未找到表结构文件: database/00_schema.sql');
    return false;
  }
  
  // 检查核心表是否存在
  const categoriesExist = await tableExists('categories');
  const usersExist = await tableExists('users');
  const aiToolsExist = await tableExists('ai_tools');
  
  if (categoriesExist && usersExist && aiToolsExist) {
    log('green', '  ✅ 核心表已存在，跳过表结构同步');
    return true;
  }
  
  log('yellow', '  ⚠️  检测到缺失的表，需要手动创建');
  log('yellow', '  请在 Supabase SQL Editor 中执行 database/00_schema.sql');
  
  return false;
}

// 同步初始数据
async function syncInitialData(): Promise<void> {
  log('blue', '\n📦 检查初始数据...');
  
  const admin = getSupabaseAdmin();
  if (!admin) {
    log('yellow', '  ⚠️  无法连接到数据库，跳过数据检查');
    return;
  }
  
  // 检查分类数据
  const { count: categoryCount, error: catError } = await admin
    .from('categories')
    .select('*', { count: 'exact', head: true });
  
  if (catError) {
    log('yellow', '  ⚠️  无法检查分类数据');
    return;
  }
  
  if (categoryCount && categoryCount > 0) {
    log('green', `  ✅ 分类数据: ${categoryCount} 条`);
  } else {
    log('yellow', '  ⚠️  分类数据为空，请执行 database/01_categories.sql');
  }
  
  // 检查用户数据
  const { count: userCount, error: userError } = await admin
    .from('users')
    .select('*', { count: 'exact', head: true });
  
  if (!userError && userCount && userCount > 0) {
    log('green', `  ✅ 用户数据: ${userCount} 条`);
  } else if (!userError) {
    log('yellow', '  ⚠️  用户数据为空，请执行 database/04_users.sql');
  }
  
  // 检查工具数据
  const { count: toolCount, error: toolError } = await admin
    .from('ai_tools')
    .select('*', { count: 'exact', head: true });
  
  if (!toolError && toolCount && toolCount > 0) {
    log('green', `  ✅ AI工具数据: ${toolCount} 条`);
  } else if (!toolError) {
    log('yellow', '  ⚠️  AI工具数据为空，请执行 database/05_ai_tools.sql');
  }
}

// 创建 RPC 执行函数的 SQL
const CREATE_EXEC_SQL_FUNCTION = `
-- 创建执行任意 SQL 的 RPC 函数
-- 注意：这个函数有安全风险，只应在需要自动同步时使用
CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
END;
$$;

-- 授予执行权限
GRANT EXECUTE ON FUNCTION exec_sql(TEXT) TO service_role;
`;

// 主函数
async function main() {
  log('cyan', '==========================================');
  log('cyan', '蚂蚁AI导航 - 自动数据库同步');
  log('cyan', '==========================================');
  console.log();
  
  // 检查是否跳过同步
  if (process.env.SKIP_DB_SYNC === 'true') {
    log('yellow', '⏭️  跳过数据库同步 (SKIP_DB_SYNC=true)');
    return;
  }
  
  // 检查是否启用自动同步
  const autoSync = process.env.AUTO_SYNC_DATABASE !== 'false'; // 默认启用
  
  if (!autoSync) {
    log('yellow', '⏭️  自动数据库同步已禁用 (AUTO_SYNC_DATABASE=false)');
    return;
  }
  
  // 检查环境变量
  const supabaseUrl = getEnvVar(['NEXT_PUBLIC_SUPABASE_URL', 'COZE_SUPABASE_URL']);
  const serviceRoleKey = getEnvVar(['SUPABASE_SERVICE_ROLE_KEY']);
  
  log('blue', '📋 环境检查:');
  console.log(`  Supabase URL: ${supabaseUrl ? '✅ 已配置' : '❌ 未配置'}`);
  console.log(`  Service Role Key: ${serviceRoleKey ? '✅ 已配置' : '⚠️  未配置（仅检查模式）'}`);
  
  if (!supabaseUrl) {
    log('red', '\n❌ 错误: 缺少 Supabase URL 配置');
    console.log('\n请设置以下环境变量:');
    console.log('  - NEXT_PUBLIC_SUPABASE_URL 或 COZE_SUPABASE_URL');
    process.exit(1);
  }
  
  if (!serviceRoleKey) {
    log('yellow', '\n⚠️  警告: 未配置 Service Role Key');
    console.log('\n仅执行数据库检查，无法自动创建表结构。');
    console.log('要启用自动同步，请在 Coze 环境变量中设置:');
    console.log('  SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>');
    console.log('\n您可以在 Supabase 控制台 -> Settings -> API 中找到 Service Role Key');
  }
  
  // 测试数据库连接
  console.log();
  log('blue', '🔌 测试数据库连接...');
  
  const admin = getSupabaseAdmin();
  if (admin) {
    try {
      const { error } = await admin.from('categories').select('id').limit(1);
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      log('green', '  ✅ 数据库连接成功');
    } catch (error: any) {
      log('red', `  ❌ 数据库连接失败: ${error.message}`);
      process.exit(1);
    }
  } else {
    log('yellow', '  ⚠️  无法创建管理员客户端');
  }
  
  // 同步表结构
  const structureOk = await syncTableStructure();
  
  // 同步初始数据
  await syncInitialData();
  
  // 输出后续步骤
  if (!structureOk || !serviceRoleKey) {
    console.log();
    log('cyan', '==========================================');
    log('cyan', '手动同步步骤');
    log('cyan', '==========================================');
    console.log();
    console.log('1. 打开 Supabase SQL Editor');
    console.log('   https://supabase.com/dashboard/project/<your-project>/sql/new');
    console.log();
    console.log('2. 执行以下文件（按顺序）:');
    console.log('   • database/00_schema.sql (必需 - 创建表结构)');
    console.log('   • database/01_categories.sql (必需 - 分类数据)');
    console.log('   • database/02_tags.sql (必需 - 标签数据)');
    console.log('   • database/04_users.sql (必需 - 默认用户)');
    console.log('   • database/05_ai_tools.sql (可选 - AI工具数据)');
    console.log();
    console.log('3. 或在命令行执行:');
    console.log('   DATABASE_URL="<your-db-url>" ./database/init.sh "$DATABASE_URL"');
  }
  
  console.log();
  log('cyan', '==========================================');
  log('green', '✅ 数据库同步检查完成');
  log('cyan', '==========================================');
}

// 导出供其他模块使用
export { syncTableStructure, syncInitialData, tableExists };

// 执行主函数
if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
