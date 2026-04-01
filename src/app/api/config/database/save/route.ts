import { NextRequest, NextResponse } from 'next/server';
import { validateConfig, saveDatabaseConfig } from '@/lib/config/database-config';

/**
 * POST - 保存数据库配置
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const config = {
      supabaseUrl: body.supabaseUrl,
      supabaseAnonKey: body.supabaseAnonKey,
      supabaseServiceRoleKey: body.supabaseServiceRoleKey,
      siteUrl: body.siteUrl,
      siteName: body.siteName,
    };

    // 验证配置
    const validation = validateConfig(config);
    if (!validation.valid) {
      return NextResponse.json(
        { error: '配置无效', errors: validation.errors },
        { status: 400 }
      );
    }

    // 保存配置
    await saveDatabaseConfig(config);

    return NextResponse.json({
      success: true,
      message: '配置保存成功',
      config: {
        supabaseUrl: config.supabaseUrl,
        siteUrl: config.siteUrl,
        siteName: config.siteName,
      },
    });
  } catch (error) {
    console.error('保存配置失败:', error);
    return NextResponse.json(
      { error: '保存配置失败', message: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
