import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

/**
 * 添加热门教程Tab
 */
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient()
    
    // 1. 查找教程分类
    const { data: categories } = await client
      .from('categories')
      .select('*')
      .ilike('name', '%教程%')
    
    let tutorialCategoryId = null
    if (categories && categories.length > 0) {
      tutorialCategoryId = categories[0].id
      console.log('找到教程分类:', categories[0].name, 'ID:', tutorialCategoryId)
    } else {
      console.warn('未找到教程分类，将使用默认逻辑')
    }
    
    // 2. 检查是否已存在教程Tab
    const { data: existingTab } = await client
      .from('home_tabs')
      .select('*')
      .eq('slug', 'tutorials')
      .single()
    
    if (existingTab) {
      // 更新现有Tab
      const { data: updatedTab, error: updateError } = await client
        .from('home_tabs')
        .update({
          name: '热门教程',
          type: 'tutorial_tools',
          icon: 'BookOpen',
          color: '#F59E0B',
          sort_order: 4, // 确保在热点资讯之前
          is_visible: true,
          source_id: tutorialCategoryId,
        })
        .eq('id', existingTab.id)
        .select()
        .single()
      
      if (updateError) {
        return NextResponse.json(
          { success: false, error: updateError.message },
          { status: 400 }
        )
      }
      
      return NextResponse.json({
        success: true,
        message: '已更新热门教程Tab',
        data: updatedTab
      })
    }
    
    // 3. 添加新Tab
    const { data: newTab, error: insertError } = await client
      .from('home_tabs')
      .insert({
        name: '热门教程',
        slug: 'tutorials',
        type: 'tutorial_tools',
        source_id: tutorialCategoryId,
        icon: 'BookOpen',
        color: '#F59E0B',
        sort_order: 4, // 确保在热点资讯之前
        is_default: false,
        is_system: true,
        is_visible: true,
      })
      .select()
      .single()
    
    if (insertError) {
      return NextResponse.json(
        { success: false, error: insertError.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: '已添加热门教程Tab',
      data: newTab
    })
  } catch (error) {
    console.error('添加热门教程Tab错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
