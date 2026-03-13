import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 创建AI大事纪数据
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      year,
      month,
      day,
      title,
      titleEn,
      description,
      category,
      importance,
      icon,
      image,
      relatedPersonId,
      relatedUrl,
      tags,
    } = body

    // 验证必填字段
    if (!year || !title || !description) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段：年份、标题和描述' },
        { status: 400 }
      )
    }

    // 验证年份不能是未来
    const currentYear = new Date().getFullYear()
    if (year > currentYear) {
      return NextResponse.json(
        { success: false, error: '年份不能是未来年份' },
        { status: 400 }
      )
    }

    const client = getSupabaseClient()

    // 创建大事纪数据
    const { data, error } = await client
      .from('ai_timeline')
      .insert({
        year,
        month,
        day,
        title,
        title_en: titleEn,
        description,
        category,
        importance: importance || 'normal',
        icon,
        image,
        related_person_id: relatedPersonId,
        related_url: relatedUrl,
        tags,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('创建AI大事纪数据错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
