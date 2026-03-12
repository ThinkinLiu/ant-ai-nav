import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const client = getSupabaseClient()

    // 获取名人详情
    const { data: person, error } = await client
      .from('ai_hall_of_fame')
      .select('*')
      .eq('id', parseInt(id))
      .single()

    if (error || !person) {
      return NextResponse.json(
        { success: false, error: '人物不存在' },
        { status: 404 }
      )
    }

    // 增加浏览量
    await client
      .from('ai_hall_of_fame')
      .update({ view_count: (person.view_count || 0) + 1 })
      .eq('id', person.id)

    // 获取相关人物（同类别或同标签）
    let relatedPeople: any[] = []
    
    // 先按类别获取
    if (person.category) {
      const { data: sameCategory } = await client
        .from('ai_hall_of_fame')
        .select('id, name, name_en, photo, title, summary, category')
        .eq('category', person.category)
        .neq('id', person.id)
        .limit(4)
      
      relatedPeople = sameCategory || []
    }

    // 如果不够4个，按标签补充
    if (relatedPeople.length < 4 && person.tags && Array.isArray(person.tags)) {
      const existingIds = relatedPeople.map(p => p.id)
      existingIds.push(person.id)
      
      const { data: sameTags } = await client
        .from('ai_hall_of_fame')
        .select('id, name, name_en, photo, title, summary, category')
        .not('id', 'in', `(${existingIds.join(',')})`)
        .limit(4 - relatedPeople.length)
      
      if (sameTags) {
        relatedPeople = [...relatedPeople, ...sameTags]
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...person,
        view_count: (person.view_count || 0) + 1,
        related: relatedPeople,
      },
    })
  } catch (error) {
    console.error('获取AI名人详情错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
