import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 创建AI名人堂数据
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      nameEn,
      photo,
      title,
      summary,
      bio,
      achievements,
      organization,
      organizationUrl,
      country,
      category,
      tags,
      isFeatured,
      birthYear,
      deathYear,
    } = body

    // 验证必填字段
    if (!name || !category) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段：姓名和分类' },
        { status: 400 }
      )
    }

    const client = getSupabaseClient()

    // 创建名人数据
    const { data, error } = await client
      .from('ai_hall_of_fame')
      .insert({
        name,
        name_en: nameEn,
        photo,
        title,
        summary,
        bio,
        achievements,
        organization,
        organization_url: organizationUrl,
        country,
        category,
        tags,
        is_featured: isFeatured || false,
        birth_year: birthYear,
        death_year: deathYear,
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
    console.error('创建AI名人堂数据错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
