import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseConfig } from '@/lib/config/database-config';
import { createClient } from '@supabase/supabase-js';

/**
 * POST - 验证数据库配置是否有效
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { supabaseUrl, supabaseAnonKey } = body;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 尝试连接数据库
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // 执行一个简单的查询测试连接
    const { error } = await supabase.from('tools').select('count', { count: 'exact', head: true });

    if (error) {
      return NextResponse.json(
        { error: '数据库连接失败', message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '数据库连接成功',
    });
  } catch (error) {
    console.error('验证配置失败:', error);
    return NextResponse.json(
      { error: '验证配置失败', message: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
