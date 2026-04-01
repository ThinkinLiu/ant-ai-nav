/**
 * 环境兼容性测试脚本
 * 测试不同环境下的环境变量读取
 */

import { validateEnv, detectEnvironment, getEnv, ENV_KEY_MAPPING } from '../src/lib/env-config';

console.log('\n========================================');
console.log('  环境兼容性测试');
console.log('========================================\n');

// 测试 1: 环境检测
console.log('📋 测试 1: 环境检测');
console.log('─'.repeat(50));
const env = detectEnvironment();
console.log(`当前环境: ${env}`);
console.log(`✅ 环境检测通过\n`);

// 测试 2: 环境变量读取
console.log('📋 测试 2: 环境变量读取');
console.log('─'.repeat(50));

// 测试 Supabase URL
const supabaseUrl = getEnv(ENV_KEY_MAPPING.supabaseUrl);
console.log(`Supabase URL: ${supabaseUrl ? '✅ 已配置' : '❌ 未配置'}`);
if (supabaseUrl) {
  console.log(`  来源: ${ENV_KEY_MAPPING.supabaseUrl.find(key => process.env[key]) || '未知'}`);
}

// 测试 Supabase Anon Key
const supabaseKey = getEnv(ENV_KEY_MAPPING.supabaseAnonKey);
console.log(`Supabase Key: ${supabaseKey ? '✅ 已配置' : '❌ 未配置'}`);
if (supabaseKey) {
  console.log(`  来源: ${ENV_KEY_MAPPING.supabaseAnonKey.find(key => process.env[key]) || '未知'}`);
}

// 测试 Coze API Key
const cozeKey = getEnv(ENV_KEY_MAPPING.cozeApiKey);
console.log(`Coze API Key: ${cozeKey ? '✅ 已配置' : '⚠️  未配置（可选）'}`);
if (cozeKey) {
  console.log(`  来源: ${ENV_KEY_MAPPING.cozeApiKey.find(key => process.env[key]) || '未知'}`);
}

console.log('');

// 测试 3: 环境验证
console.log('📋 测试 3: 环境验证');
console.log('─'.repeat(50));
const result = validateEnv();
console.log(`配置状态: ${result.isValid ? '✅ 有效' : '❌ 无效'}`);

if (result.missing.length > 0) {
  console.log('缺少的环境变量:');
  result.missing.forEach(item => console.log(`  - ${item}`));
}

if (result.warnings.length > 0) {
  console.log('警告:');
  result.warnings.forEach(item => console.log(`  - ${item}`));
}

console.log('');

// 测试 4: 环境变量优先级
console.log('📋 测试 4: 环境变量优先级');
console.log('─'.repeat(50));
console.log('Supabase URL 优先级:');
ENV_KEY_MAPPING.supabaseUrl.forEach((key, index) => {
  const value = process.env[key];
  console.log(`  ${index + 1}. ${key}: ${value ? '✅ 已设置' : '❌ 未设置'}`);
});

console.log('\nSupabase Anon Key 优先级:');
ENV_KEY_MAPPING.supabaseAnonKey.forEach((key, index) => {
  const value = process.env[key];
  console.log(`  ${index + 1}. ${key}: ${value ? '✅ 已设置' : '❌ 未设置'}`);
});

console.log('\n========================================');
console.log(`  测试结果: ${result.isValid ? '✅ 全部通过' : '❌ 存在问题'}`);
console.log('========================================\n');

process.exit(result.isValid ? 0 : 1);
