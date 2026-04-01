/**
 * 配置文件管理
 * 用于运行时数据库配置
 */

import fs from 'fs/promises';
import path from 'path';

export interface DatabaseConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey?: string;
  siteUrl?: string;
  siteName?: string;
}

const CONFIG_FILE_PATH = '/app/config/database.json';

/**
 * 确保配置目录存在
 */
async function ensureConfigDir(): Promise<void> {
  const configDir = path.dirname(CONFIG_FILE_PATH);
  try {
    await fs.access(configDir);
  } catch {
    await fs.mkdir(configDir, { recursive: true });
  }
}

/**
 * 读取数据库配置
 */
export async function getDatabaseConfig(): Promise<DatabaseConfig | null> {
  try {
    await ensureConfigDir();
    const configData = await fs.readFile(CONFIG_FILE_PATH, 'utf-8');
    return JSON.parse(configData) as DatabaseConfig;
  } catch (error) {
    // 文件不存在或读取错误
    return null;
  }
}

/**
 * 保存数据库配置
 */
export async function saveDatabaseConfig(config: DatabaseConfig): Promise<void> {
  await ensureConfigDir();
  await fs.writeFile(
    CONFIG_FILE_PATH,
    JSON.stringify(config, null, 2),
    'utf-8'
  );
}

/**
 * 检查是否已配置数据库
 */
export async function isDatabaseConfigured(): Promise<boolean> {
  const config = await getDatabaseConfig();
  return !!config && !!config.supabaseUrl && !!config.supabaseAnonKey;
}

/**
 * 验证配置是否有效
 */
export function validateConfig(config: DatabaseConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.supabaseUrl) {
    errors.push('Supabase URL 不能为空');
  } else if (!config.supabaseUrl.startsWith('https://')) {
    errors.push('Supabase URL 必须以 https:// 开头');
  } else {
    // 验证 URL 格式
    try {
      new URL(config.supabaseUrl);
    } catch {
      errors.push('Supabase URL 格式无效');
    }
  }

  if (!config.supabaseAnonKey) {
    errors.push('Supabase Anonymous Key 不能为空');
  } else if (config.supabaseAnonKey.length < 50) {
    errors.push('Supabase Anonymous Key 格式不正确');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
