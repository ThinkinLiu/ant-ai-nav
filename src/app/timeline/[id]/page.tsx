import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseClient, tryGetSupabaseClient } from '@/storage/database/supabase-client'
import { categoryConfig, importanceConfig } from '../config'
import { EventDetail } from './EventDetail'

interface Props {
  params: Promise<{ id: string }>
}

// 强制动态渲染，避免构建时访问数据库
export const dynamic = 'force-dynamic'

// 生成静态参数 - 在构建时如果环境变量不存在则返回空数组
export async function generateStaticParams() {
  const supabase = tryGetSupabaseClient()
  if (!supabase) {
    return []
  }
  
  const { data: events } = await supabase
    .from('ai_timeline')
    .select('id')
  
  return events?.map((event) => ({
    id: event.id.toString(),
  })) || []
}

// 生成元数据
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = getSupabaseClient()
  
  const { data: event } = await supabase
    .from('ai_timeline')
    .select('title, title_en, description, year')
    .eq('id', parseInt(id))
    .single()

  if (!event) {
    return {
      title: '事件不存在',
    }
  }

  const title = `${event.year}年 - ${event.title} - AI大事纪`

  return {
    title,
    description: event.description,
  }
}

export default async function EventPage({ params }: Props) {
  const { id } = await params
  const supabase = getSupabaseClient()

  // 获取事件详情
  const { data: event, error } = await supabase
    .from('ai_timeline')
    .select(`
      *,
      related_person:ai_hall_of_fame(id, name, name_en, photo, title)
    `)
    .eq('id', parseInt(id))
    .single()

  if (error || !event) {
    notFound()
  }

  // 增加浏览量
  await supabase
    .from('ai_timeline')
    .update({ view_count: (event.view_count || 0) + 1 })
    .eq('id', event.id)

  // 获取同年份其他事件
  const { data: sameYearEvents } = await supabase
    .from('ai_timeline')
    .select('id, year, month, day, title, icon, importance')
    .eq('year', event.year)
    .neq('id', event.id)
    .order('month', { ascending: true, nullsFirst: false })

  // 获取相邻事件
  const { data: prevEvent } = await supabase
    .from('ai_timeline')
    .select('id, year, title, icon')
    .lt('year', event.year)
    .order('year', { ascending: false })
    .limit(1)
    .single()

  const { data: nextEvent } = await supabase
    .from('ai_timeline')
    .select('id, year, title, icon')
    .gt('year', event.year)
    .order('year', { ascending: true })
    .limit(1)
    .single()

  return (
    <EventDetail 
      event={event} 
      sameYearEvents={sameYearEvents || []}
      prevEvent={prevEvent}
      nextEvent={nextEvent}
    />
  )
}
