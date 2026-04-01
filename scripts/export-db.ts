/**
 * 数据库导出脚本
 * 将所有工具相关数据导出为初始化SQL文件
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Supabase 配置 - 优先使用系统环境变量
const supabaseUrl = process.env.COZE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.COZE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 输出目录
const outputDir = path.join(process.cwd(), 'database');

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 转义SQL字符串
function escapeSQL(str: string | null | undefined): string {
  if (str === null || str === undefined) return 'NULL';
  return `'${str.replace(/'/g, "''").replace(/\\/g, '\\\\')}'`;
}

// 转义布尔值
function escapeBool(value: boolean | null): string {
  if (value === null) return 'NULL';
  return value ? 'true' : 'false';
}

// 转义数字
function escapeNumber(value: number | null): string {
  if (value === null) return 'NULL';
  return String(value);
}

// 导出分类数据
async function exportCategories() {
  console.log('导出分类数据...');
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('id');

  if (error) throw error;

  const lines: string[] = [];
  lines.push('-- 分类数据');
  lines.push('-- 清空现有数据');
  lines.push('TRUNCATE TABLE categories CASCADE;');
  lines.push('');
  lines.push('-- 插入分类数据');

  for (const cat of data) {
    const values = [
      escapeNumber(cat.id),
      escapeSQL(cat.name),
      escapeSQL(cat.slug),
      escapeSQL(cat.description),
      escapeSQL(cat.icon),
      escapeNumber(cat.parent_id),
      escapeNumber(cat.sort_order),
      escapeBool(cat.is_active),
      escapeSQL(cat.created_at),
      escapeSQL(cat.updated_at)
    ].join(', ');

    lines.push(`INSERT INTO categories (id, name, slug, description, icon, parent_id, sort_order, is_active, created_at, updated_at) VALUES (${values});`);
  }

  fs.writeFileSync(path.join(outputDir, '01_categories.sql'), lines.join('\n'));
  console.log(`✅ 已导出 ${data.length} 个分类`);
  return data.length;
}

// 导出标签数据
async function exportTags() {
  console.log('导出标签数据...');
  
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('id');

  if (error) throw error;

  const lines: string[] = [];
  lines.push('-- 标签数据');
  lines.push('-- 清空现有数据');
  lines.push('TRUNCATE TABLE tags CASCADE;');
  lines.push('');
  lines.push('-- 插入标签数据');

  for (const tag of data) {
    // 获取所有字段
    const fields = Object.keys(tag);
    const values = fields.map(f => {
      const val = tag[f];
      if (val === null || val === undefined) return 'NULL';
      if (typeof val === 'number') return String(val);
      if (typeof val === 'boolean') return val ? 'true' : 'false';
      return escapeSQL(val);
    }).join(', ');

    lines.push(`INSERT INTO tags (${fields.join(', ')}) VALUES (${values});`);
  }

  fs.writeFileSync(path.join(outputDir, '02_tags.sql'), lines.join('\n'));
  console.log(`✅ 已导出 ${data.length} 个标签`);
  return data.length;
}

// 导出用户数据（发布者）
async function exportUsers() {
  console.log('导出用户数据...');
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at');

  if (error) {
    console.log('  用户表为空或不存在，跳过');
    return 0;
  }

  const lines: string[] = [];
  lines.push('-- 用户数据');
  lines.push('-- 注意: 用户数据包含敏感信息，请谨慎处理');
  lines.push('-- 生产环境建议仅导入必要的系统用户');
  lines.push('');
  lines.push('-- 清空现有数据 (可选)');
  lines.push('-- TRUNCATE TABLE users CASCADE;');
  lines.push('');
  lines.push('-- 插入用户数据');

  for (const user of data) {
    const values = [
      escapeSQL(user.id),
      escapeSQL(user.email),
      escapeSQL(user.name),
      escapeSQL(user.avatar),
      escapeSQL(user.role),
      escapeSQL(user.bio),
      escapeSQL(user.website),
      escapeBool(user.is_active),
      escapeSQL(user.created_at),
      escapeSQL(user.updated_at)
    ].join(', ');

    lines.push(`INSERT INTO users (id, email, name, avatar, role, bio, website, is_active, created_at, updated_at) VALUES (${values}) ON CONFLICT (id) DO NOTHING;`);
  }

  fs.writeFileSync(path.join(outputDir, '03_users.sql'), lines.join('\n'));
  console.log(`✅ 已导出 ${data.length} 个用户`);
  return data.length;
}

// 导出工具数据（分批处理）
async function exportTools() {
  console.log('导出工具数据...');
  
  const batchSize = 500;
  let offset = 0;
  let totalCount = 0;
  const lines: string[] = [];
  
  lines.push('-- AI工具数据');
  lines.push('-- 清空现有数据');
  lines.push('TRUNCATE TABLE ai_tools CASCADE;');
  lines.push('');
  lines.push('-- 插入工具数据');

  while (true) {
    const { data, error } = await supabase
      .from('ai_tools')
      .select('*')
      .order('id')
      .range(offset, offset + batchSize - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    for (const tool of data) {
      const values = [
        escapeNumber(tool.id),
        escapeSQL(tool.name),
        escapeSQL(tool.slug),
        escapeSQL(tool.description),
        escapeSQL(tool.long_description),
        escapeSQL(tool.website),
        escapeSQL(tool.logo),
        escapeSQL(tool.screenshots),
        escapeNumber(tool.category_id),
        escapeSQL(tool.publisher_id),
        escapeSQL(tool.status),
        escapeBool(tool.is_featured),
        escapeBool(tool.is_pinned),
        escapeBool(tool.is_free),
        escapeSQL(tool.pricing_info),
        escapeNumber(tool.view_count),
        escapeNumber(tool.favorite_count),
        escapeSQL(tool.reject_reason),
        escapeSQL(tool.created_at),
        escapeSQL(tool.updated_at)
      ].join(', ');

      lines.push(`INSERT INTO ai_tools (id, name, slug, description, long_description, website, logo, screenshots, category_id, publisher_id, status, is_featured, is_pinned, is_free, pricing_info, view_count, favorite_count, reject_reason, created_at, updated_at) VALUES (${values});`);
    }

    totalCount += data.length;
    offset += batchSize;
    console.log(`  已处理 ${totalCount} 个工具...`);
  }

  fs.writeFileSync(path.join(outputDir, '04_ai_tools.sql'), lines.join('\n'));
  console.log(`✅ 已导出 ${totalCount} 个工具`);
  return totalCount;
}

// 导出工具标签关联
async function exportToolTags() {
  console.log('导出工具标签关联...');
  
  const { data, error } = await supabase
    .from('tool_tags')
    .select('*')
    .order('id');

  if (error) throw error;

  const lines: string[] = [];
  lines.push('-- 工具标签关联数据');
  lines.push('-- 清空现有数据');
  lines.push('TRUNCATE TABLE tool_tags CASCADE;');
  lines.push('');
  lines.push('-- 插入关联数据');

  for (const tt of data) {
    const values = [
      escapeNumber(tt.id),
      escapeNumber(tt.tool_id),
      escapeNumber(tt.tag_id)
    ].join(', ');

    lines.push(`INSERT INTO tool_tags (id, tool_id, tag_id) VALUES (${values});`);
  }

  fs.writeFileSync(path.join(outputDir, '05_tool_tags.sql'), lines.join('\n'));
  console.log(`✅ 已导出 ${data.length} 条关联`);
  return data.length;
}

// 创建主SQL文件
function createMainSQL() {
  console.log('创建主SQL文件...');
  
  const lines: string[] = [];
  lines.push('-- 蚂蚁AI导航数据库初始化脚本');
  lines.push('-- 生成时间: ' + new Date().toISOString());
  lines.push('');
  lines.push('-- 按顺序导入各表数据');
  lines.push('-- 1. 先导入分类（其他表依赖）');
  lines.push('\\i 01_categories.sql');
  lines.push('');
  lines.push('-- 2. 导入标签');
  lines.push('\\i 02_tags.sql');
  lines.push('');
  lines.push('-- 3. 导入用户（可选，包含敏感信息）');
  lines.push('-- \\i 03_users.sql');
  lines.push('');
  lines.push('-- 4. 导入工具');
  lines.push('\\i 04_ai_tools.sql');
  lines.push('');
  lines.push('-- 5. 导入工具标签关联');
  lines.push('\\i 05_tool_tags.sql');
  lines.push('');
  lines.push('-- 完成');
  lines.push('SELECT \'数据库初始化完成\' AS status;');

  fs.writeFileSync(path.join(outputDir, 'init.sql'), lines.join('\n'));
  console.log('✅ 主SQL文件创建完成');
}

// 主函数
async function main() {
  console.log('开始导出数据库...');
  console.log(`输出目录: ${outputDir}`);
  console.log('');

  try {
    const stats = {
      categories: await exportCategories(),
      tags: await exportTags(),
      users: await exportUsers(),
      tools: await exportTools(),
      toolTags: await exportToolTags()
    };

    createMainSQL();

    console.log('');
    console.log('========== 导出完成 ==========');
    console.log(`分类: ${stats.categories}`);
    console.log(`标签: ${stats.tags}`);
    console.log(`用户: ${stats.users}`);
    console.log(`工具: ${stats.tools}`);
    console.log(`工具标签关联: ${stats.toolTags}`);
    console.log('');
    console.log(`SQL文件已保存到: ${outputDir}`);
  } catch (error) {
    console.error('导出失败:', error);
    process.exit(1);
  }
}

main();
