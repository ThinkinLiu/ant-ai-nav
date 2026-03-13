import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 更新AI大事纪数据
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
      .from('ai_timeline')
      .select('id')
      .eq('id', parseInt(id))
      .single()

    if (!existing) {
      return NextResponse.json(
        { success: false, error: '数据不存在' },
        { status: 404 }
      )
    }

    // 如果修改了年份，验证不能是未来
    if (body.year !== undefined) {
      const currentYear = new Date().getFullYear()
      if (body.year > currentYear) {
        return NextResponse.json(
          { success: false, error: '年份不能是未来年份' },
          { status: 400 }
        )
      }
    }

    // 构建更新对象
    const updateData: any = {}
    const fieldMapping = {
      year: 'year',
      month: 'month',
      day: 'day',
      title: 'title',
      titleEn: 'title_en',
      description: 'description',
      category: 'category',
      importance: 'importance',
      icon: 'icon',
      image: 'image',
      relatedPersonId: 'related_person_id',
      relatedUrl: 'related_url',
      tags: 'tags',
    }

    Object.entries(fieldMapping).forEach(([bodyField, dbField]) => {
      if (body[bodyField] !== undefined) {
        updateData[dbField] = body[bodyField]
      }
    })

    // 更新数据
    const { data, error } = await client
      .from('ai_timeline')
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
    console.error('更新AI大事纪数据错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 删除AI大事纪数据
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const client = getSupabaseClient()

    // 检查数据是否存在
    const { data: existing } = await client
      .from('ai_timeline')
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
      .from('ai_timeline')
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
    console.error('删除AI大事纪数据错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
