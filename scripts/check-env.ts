#!/usr/bin/env tsx
/**
 * 环境变量检查脚本
 * 用于验证环境配置是否正确
 */

import { validateEnv, detectEnvironment, generateEnvHelp } from '../src/lib/env-config';
import chalk from 'chalk';

// 解析命令行参数
const args = process.argv.slice(2);
const showHelp = args.includes('--help') || args.includes('-h');
const showConfig = args.includes('--config') || args.includes('-c');
const jsonOutput = args.includes('--json');

// 显示帮助信息
if (showHelp) {
  console.log(generateEnvHelp());
  process.exit(0);
}

// 验证环境变量
const result = validateEnv();

// JSON 输出模式
if (jsonOutput) {
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.isValid ? 0 : 1);
}

// 打印验证结果
console.log('\n' + chalk.bold('========================================'));
console.log(chalk.bold('  环境变量配置检查'));
console.log(chalk.bold('========================================\n'));

console.log(`${chalk.blue('当前环境:')} ${chalk.cyan(result.environment)}`);
console.log(`${chalk.blue('配置状态:')} ${result.isValid ? chalk.green('✅ 有效') : chalk.red('❌ 无效')}\n`);

if (result.missing.length > 0) {
  console.log(chalk.red('❌ 缺少必需的环境变量:'));
  result.missing.forEach(item => {
    console.log(chalk.red(`  - ${item}`));
  });
  console.log('');
}

if (result.warnings.length > 0) {
  console.log(chalk.yellow('⚠️  警告:'));
  result.warnings.forEach(item => {
    console.log(chalk.yellow(`  - ${item}`));
  });
  console.log('');
}

// 显示详细配置
if (showConfig && result.config) {
  console.log(chalk.blue('📋 当前配置:'));
  console.log(chalk.gray('─'.repeat(50)));
  
  console.log(chalk.bold('\n[Supabase]'));
  console.log(`  URL: ${result.config.supabaseUrl.substring(0, 40)}...`);
  console.log(`  Key: ${result.config.supabaseAnonKey.substring(0, 20)}...`);
  
  if (result.config.cozeApiKey) {
    console.log(chalk.bold('\n[Coze API]'));
    console.log(`  Key: ${result.config.cozeApiKey.substring(0, 20)}...`);
    if (result.config.cozeClientId) {
      console.log(`  Client ID: ${result.config.cozeClientId}`);
    }
    if (result.config.cozeBaseUrl) {
      console.log(`  Base URL: ${result.config.cozeBaseUrl}`);
    }
  }
  
  if (result.config.s3BucketName) {
    console.log(chalk.bold('\n[S3 Storage]'));
    console.log(`  Bucket: ${result.config.s3BucketName}`);
    if (result.config.s3Endpoint) {
      console.log(`  Endpoint: ${result.config.s3Endpoint}`);
    }
    if (result.config.s3Region) {
      console.log(`  Region: ${result.config.s3Region}`);
    }
  }
  
  console.log(chalk.gray('\n' + '─'.repeat(50)));
}

// 提供修复建议
if (!result.isValid) {
  console.log(chalk.cyan('\n📝 修复建议:'));
  console.log(chalk.white('1. 复制环境变量模板:'));
  console.log(chalk.gray('   cp .env.example .env.local'));
  console.log(chalk.white('\n2. 编辑 .env.local 文件，填写实际的配置值'));
  console.log(chalk.white('\n3. 查看详细文档:'));
  console.log(chalk.gray('   - docs/deployment-guide.md'));
  console.log(chalk.gray('   - README.md'));
  console.log(chalk.white('\n4. 或者在 Coze 环境中设置以下环境变量:'));
  console.log(chalk.gray('   - COZE_SUPABASE_URL'));
  console.log(chalk.gray('   - COZE_SUPABASE_ANON_KEY'));
  console.log('');
}

console.log(chalk.bold('========================================\n'));

process.exit(result.isValid ? 0 : 1);
