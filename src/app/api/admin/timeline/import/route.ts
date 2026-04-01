import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

interface TimelineEvent {
  year: number
  month: number
  day: number
  title: string
  titleEn: string
  description: string
  category: string
  importance: string
  icon: string
  image: string
  relatedUrl: string
  tags: string[]
}

// 批量导入AI大事纪
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { events } = body

    if (!events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { success: false, error: '事件数据不能为空' },
        { status: 400 }
      )
    }

    const client = getSupabaseClient()
    const importedEvents: any[] = []
    const errors: string[] = []

    for (const event of events as TimelineEvent[]) {
      try {
        // 检查是否已存在相同的事件
        const { data: existing } = await client
          .from('ai_timeline')
          .select('id')
          .eq('title', event.title)
          .eq('year', event.year)
          .eq('month', event.month)
          .eq('day', event.day)
          .single()

        if (existing) {
          errors.push(`"${event.title}" (${event.year}-${event.month}-${event.day}) 已存在，跳过导入`)
          continue
        }

        // 插入新事件
        const { data, error } = await client
          .from('ai_timeline')
          .insert({
            year: event.year,
            month: event.month,
            day: event.day,
            title: event.title,
            title_en: event.titleEn || '',
            description: event.description || '',
            category: event.category || 'other',
            importance: event.importance || 'normal',
            icon: event.icon || '📌',
            image: event.image || '',
            related_url: event.relatedUrl || '',
            tags: event.tags || [],
            view_count: 0,
            created_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (error) {
          errors.push(`"${event.title}" 导入失败: ${error.message}`)
        } else {
          importedEvents.push(data)
        }
      } catch (e: any) {
        errors.push(`"${event.title}" 导入异常: ${e.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        imported: importedEvents,
        importedCount: importedEvents.length,
        totalAttempted: events.length,
        errors: errors,
      },
    })
  } catch (error) {
    console.error('批量导入AI大事纪错误:', error)
    return NextResponse.json(
      { success: false, error: '导入失败，请稍后重试' },
      { status: 500 }
    )
  }
}
