import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

export async function GET() {
  try {
    const client = getSupabaseClient()
    
    // 并行查询：分类列表 + 工具计数聚合
    const [categoriesResult, countResult] = await Promise.all([
      client
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),
      // 使用聚合查询一次性获取所有分类的工具数量
      client
        .from('ai_tools')
        .select('category_id')
        .eq('status', 'approved')
    ])

    if (categoriesResult.error) {
      return NextResponse.json(
        { success: false, error: categoriesResult.error.message },
        { status: 400 }
      )
    }

    // 在内存中计算每个分类的工具数量（避免N+1查询）
    const countMap = new Map<number, number>()
    if (countResult.data) {
      for (const tool of countResult.data) {
        const count = countMap.get(tool.category_id) || 0
        countMap.set(tool.category_id, count + 1)
      }
    }

    const categoriesWithCount = (categoriesResult.data || []).map(category => ({
      ...category,
      toolCount: countMap.get(category.id) || 0,
    }))

    return NextResponse.json({
      success: true,
      data: categoriesWithCount,
    })
  } catch (error) {
    console.error('获取分类错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
