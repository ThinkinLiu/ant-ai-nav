import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

export async function GET() {
  try {
    const client = getSupabaseClient()
    
    // 1. 获取分类列表
    const { data: categories, error } = await client
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    // 2. 使用RPC聚合查询获取每个分类的工具数量
    const { data: countData } = await client
      .rpc('get_tool_counts_by_category')

    // 创建数量映射
    const countMap = new Map<number, number>()
    if (countData) {
      for (const item of countData) {
        countMap.set(item.category_id, item.count)
      }
    }

    // 计算总工具数量
    const totalToolCount = Array.from(countMap.values()).reduce((sum, count) => sum + count, 0)

    // 组装分类数据
    const categoriesWithCount = (categories || []).map(category => ({
      ...category,
      toolCount: countMap.get(category.id) || 0,
    }))

    return NextResponse.json({
      success: true,
      data: categoriesWithCount,
      totalToolCount,
    })
  } catch (error) {
    console.error('获取分类错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
