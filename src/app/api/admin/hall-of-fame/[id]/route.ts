import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 更新AI名人堂数据
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const client = getSupabaseClient()

    // 检查数据是否存在
    const { data: existing } = await client
      .from('ai_hall_of_fame')
      .select('id')
      .eq('id', parseInt(id))
      .single()

    if (!existing) {
      return NextResponse.json(
        { success: false, error: '数据不存在' },
        { status: 404 }
      )
    }

    // 构建更新对象
    const updateData: any = {}
    const fieldMapping = {
      name: 'name',
      nameEn: 'name_en',
      photo: 'photo',
      title: 'title',
      summary: 'summary',
      bio: 'bio',
      achievements: 'achievements',
      organization: 'organization',
      organizationUrl: 'organization_url',
      country: 'country',
      category: 'category',
      tags: 'tags',
      isFeatured: 'is_featured',
      birthYear: 'birth_year',
      deathYear: 'death_year',
    }

    Object.entries(fieldMapping).forEach(([bodyField, dbField]) => {
      if (body[bodyField] !== undefined) {
        updateData[dbField] = body[bodyField]
      }
    })

    updateData.updated_at = new Date().toISOString()

    // 更新数据
    const { data, error } = await client
      .from('ai_hall_of_fame')
      .update(updateData)
      .eq('id', parseInt(id))
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
    console.error('更新AI名人堂数据错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 删除AI名人堂数据
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const client = getSupabaseClient()

    // 检查数据是否存在
    const { data: existing } = await client
      .from('ai_hall_of_fame')
      .select('id')
      .eq('id', parseInt(id))
      .single()

    if (!existing) {
      return NextResponse.json(
        { success: false, error: '数据不存在' },
        { status: 404 }
      )
    }

    // 删除数据
    const { error } = await client
      .from('ai_hall_of_fame')
      .delete()
      .eq('id', parseInt(id))

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '删除成功',
    })
  } catch (error) {
    console.error('删除AI名人堂数据错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
