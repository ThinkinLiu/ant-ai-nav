import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

/**
 * 数据库初始化 API
 * 
 * POST /api/admin/init-database
 * 
 * 请求体:
 * {
 *   "action": "check" | "init" | "reset",
 *   "tables": string[] // 可选，指定要初始化的表
 * }
 * 
 * 注意: 此 API 需要 Service Role Key 进行鉴权
 */

// 表创建顺序（考虑外键依赖）
const TABLE_CREATION_ORDER = [
  'users',
  'categories',
  'tags',
  'ai_tools',
  'ai_hall_of_fame',
  'ai_timeline',
  'tool_tags',
  'comments',
  'favorites',
  'publisher_applications',
  'ai_tool_rankings',
  'ranking_update_log',
  'seo_settings',
  'site_settings',
  'traffic_data_sources',
];

// 获取环境变量
function getEnvVar(names: string[]): string | undefined {
  for (const name of names) {
    const value = process.env[name];
    if (value) return value;
  }
  return undefined;
}

// 验证授权
function validateAuth(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  const serviceRoleKey = getEnvVar(['SUPABASE_SERVICE_ROLE_KEY']);
  
  if (!serviceRoleKey) {
    return false;
  }
  
  // 检查 Bearer token
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return token === serviceRoleKey;
  }
  
  // 也支持通过查询参数传递（用于简单场景）
  const url = new URL(request.url);
  const key = url.searchParams.get('key');
  return key === serviceRoleKey;
}

// 检查表是否存在
async function checkTableExists(
  supabase: ReturnType<typeof createClient>,
  tableName: string
): Promise<{ exists: boolean; count?: number }> {
  try {
    const { count, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      return { exists: false };
    }
    
    return { exists: true, count: count || 0 };
  } catch {
    return { exists: false };
  }
}

// 获取数据库状态
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getDatabaseStatus(supabase: any) {
  const status: Record<string, { exists: boolean; count: number }> = {};
  
  for (const table of TABLE_CREATION_ORDER) {
    const { exists, count } = await checkTableExists(supabase, table);
    status[table] = { exists: exists || false, count: count || 0 };
  }
  
  return status;
}

export async function GET(request: Request) {
  try {
    const supabaseUrl = getEnvVar(['NEXT_PUBLIC_SUPABASE_URL', 'COZE_SUPABASE_URL']);
    const supabaseKey = getEnvVar(['SUPABASE_SERVICE_ROLE_KEY', 'NEXT_PUBLIC_SUPABASE_ANON_KEY']);
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    
    const status = await getDatabaseStatus(supabase);
    const missingTables = Object.entries(status)
      .filter(([_, { exists }]) => !exists)
      .map(([name]) => name);
    
    return NextResponse.json({
      success: true,
      status,
      summary: {
        total: TABLE_CREATION_ORDER.length,
        existing: TABLE_CREATION_ORDER.length - missingTables.length,
        missing: missingTables.length,
        missingTables,
      },
      instructions: missingTables.length > 0 ? {
        message: 'Please execute SQL files in Supabase SQL Editor',
        files: [
          'database/00_schema.sql - Required: Creates table structure',
          'database/01_categories.sql - Required: Category data',
          'database/02_tags.sql - Required: Tag data',
          'database/04_users.sql - Required: Default users',
          'database/05_ai_tools.sql - Optional: AI tools data',
        ],
      } : null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // 验证授权
    if (!validateAuth(request)) {
      return NextResponse.json(
        { error: 'Unauthorized. Please provide valid Service Role Key.' },
        { status: 401 }
      );
    }
    
    const supabaseUrl = getEnvVar(['NEXT_PUBLIC_SUPABASE_URL', 'COZE_SUPABASE_URL']);
    const serviceRoleKey = getEnvVar(['SUPABASE_SERVICE_ROLE_KEY']);
    
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Database not configured or missing Service Role Key' },
        { status: 503 }
      );
    }
    
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    
    // 解析请求体
    let body: { action?: string; tables?: string[] } = {};
    try {
      body = await request.json();
    } catch {
      // 使用默认值
    }
    
    const action = body.action || 'check';
    
    switch (action) {
      case 'check': {
        const status = await getDatabaseStatus(supabase);
        return NextResponse.json({ success: true, status });
      }
      
      case 'init': {
        // 自动初始化需要 exec_sql RPC 函数
        // 这里只返回指导信息
        return NextResponse.json({
          success: false,
          message: 'Auto-initialization requires setup. Please follow manual steps:',
          steps: [
            '1. Go to Supabase SQL Editor',
            '2. Execute database/00_schema.sql to create tables',
            '3. Execute other SQL files to import data',
          ],
        });
      }
      
      case 'reset': {
        // 危险操作，需要额外的确认
        return NextResponse.json({
          success: false,
          message: 'Reset operation is disabled for safety. Please use Supabase dashboard.',
        });
      }
      
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: check, init, or reset' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
