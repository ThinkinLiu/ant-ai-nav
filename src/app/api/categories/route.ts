import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

export async function GET() {
  try {
    const client = getSupabaseClient()
    
    // 获取所有分类
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

    // 获取每个分类的工具数量
    const categoriesWithCount = await Promise.all(
      (categories || []).map(async (category) => {
        const { count } = await client
          .from('ai_tools')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', category.id)
          .eq('status', 'approved')
        
        return {
          ...category,
          toolCount: count || 0,
        }
      })
    )

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
