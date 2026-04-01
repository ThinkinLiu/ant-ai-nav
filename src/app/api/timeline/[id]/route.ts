import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const client = getSupabaseClient()

    // 获取事件详情
    const { data: event, error } = await client
      .from('ai_timeline')
      .select(`
        *,
        related_person:ai_hall_of_fame(id, name, name_en, photo, title)
      `)
      .eq('id', parseInt(id))
      .single()

    if (error || !event) {
      return NextResponse.json(
        { success: false, error: '事件不存在' },
        { status: 404 }
      )
    }

    // 增加浏览量
    await client
      .from('ai_timeline')
      .update({ view_count: (event.view_count || 0) + 1 })
      .eq('id', event.id)

    // 获取同年份的其他事件
    const { data: sameYearEvents } = await client
      .from('ai_timeline')
      .select('id, year, month, day, title, icon, importance')
      .eq('year', event.year)
      .neq('id', event.id)
      .order('month', { ascending: true, nullsFirst: false })

    // 获取相邻年份的事件
    const { data: prevEvent } = await client
      .from('ai_timeline')
      .select('id, year, title, icon')
      .lt('year', event.year)
      .order('year', { ascending: false })
      .limit(1)
      .single()

    const { data: nextEvent } = await client
      .from('ai_timeline')
      .select('id, year, title, icon')
      .gt('year', event.year)
      .order('year', { ascending: true })
      .limit(1)
      .single()

    return NextResponse.json({
      success: true,
      data: {
        ...event,
        view_count: (event.view_count || 0) + 1,
        sameYearEvents: sameYearEvents || [],
        prevEvent,
        nextEvent,
      },
    })
  } catch (error) {
    console.error('获取AI大事纪详情错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
