import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 禁用静态生成，强制动态渲染
export const dynamic = 'force-dynamic';

// 延迟初始化 Supabase 客户端，避免构建时环境变量缺失问题
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing required Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    console.log("🗑️ 开始删除今天添加的虚假工具数据...\n");

    // 获取今天的日期（2026-03-29）
    const today = new Date('2026-03-29T00:00:00+08:00').toISOString();
    const nextDay = new Date('2026-03-30T00:00:00+08:00').toISOString();

    console.log(`📅 查询日期范围: ${today} 到 ${nextDay}\n`);

    // 查询今天添加的所有工具
    const { data: toolsToDelete, error: queryError } = await supabase
      .from('ai_tools')
      .select('id, name, slug, website, created_at')
      .gte('created_at', today)
      .lt('created_at', nextDay)
      .order('created_at', { ascending: true });

    if (queryError) {
      console.error("❌ 查询失败:", queryError);
      return NextResponse.json(
        { success: false, error: queryError.message },
        { status: 500 }
      );
    }

    if (!toolsToDelete || toolsToDelete.length === 0) {
      console.log("✅ 没有找到今天添加的工具");
      return NextResponse.json({
        success: true,
        message: "没有找到需要删除的工具",
        deleted: 0,
        tools: []
      });
    }

    console.log(`📋 找到 ${toolsToDelete.length} 个今天添加的工具:\n`);

    // 列出所有要删除的工具
    toolsToDelete.forEach((tool, index) => {
      console.log(`  ${index + 1}. ${tool.name} (${tool.slug})`);
      console.log(`     URL: ${tool.website}`);
      console.log(`     ID: ${tool.id}`);
      console.log(`     创建时间: ${tool.created_at}\n`);
    });

    // 删除这些工具
    const idsToDelete = toolsToDelete.map(t => t.id);
    const { error: deleteError } = await supabase
      .from('ai_tools')
      .delete()
      .in('id', idsToDelete);

    if (deleteError) {
      console.error("❌ 删除失败:", deleteError);
      return NextResponse.json(
        { success: false, error: deleteError.message },
        { status: 500 }
      );
    }

    console.log(`✅ 成功删除 ${idsToDelete.length} 个工具\n`);

    // 获取删除后的总数
    const { count } = await supabase
      .from('ai_tools')
      .select('*', { count: 'exact', head: true });

    console.log(`📊 删除后数据库工具总数: ${count || 0} 个\n`);

    return NextResponse.json({
      success: true,
      message: `成功删除 ${idsToDelete.length} 个虚假工具`,
      deleted: idsToDelete.length,
      tools: toolsToDelete,
      currentTotal: count || 0
    });

  } catch (error: any) {
    console.error("❌ 操作失败:", error);
    return NextResponse.json(
      { success: false, error: error.message || "删除失败" },
      { status: 500 }
    );
  }
}
