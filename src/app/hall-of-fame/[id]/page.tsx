import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getSupabaseClient, tryGetSupabaseClient } from '@/storage/database/supabase-client'
import { PersonDetail } from './PersonDetail'

interface Props {
  params: Promise<{ id: string }>
}

// 强制动态渲染，避免构建时访问数据库
export const dynamic = 'force-dynamic'

// 生成静态参数 - 在构建时如果环境变量不存在则返回空数组
export async function generateStaticParams() {
  const supabase = tryGetSupabaseClient()
  if (!supabase) {
    // 构建时环境变量不存在，返回空数组
    // 这样页面会在运行时动态生成
    return []
  }
  
  const { data: people } = await supabase
    .from('ai_hall_of_fame')
    .select('id')
  
  return people?.map((person) => ({
    id: person.id.toString(),
  })) || []
}

// 生成元数据
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = getSupabaseClient()
  
  const { data: person } = await supabase
    .from('ai_hall_of_fame')
    .select('name, name_en, title, summary, photo')
    .eq('id', parseInt(id))
    .single()

  if (!person) {
    return {
      title: '人物不存在',
    }
  }

  const title = person.name_en 
    ? `${person.name} (${person.name_en}) - AI名人堂`
    : `${person.name} - AI名人堂`

  return {
    title,
    description: person.summary,
    openGraph: {
      title,
      description: person.summary,
      images: person.photo ? [person.photo] : [],
    },
  }
}

export default async function PersonPage({ params }: Props) {
  const { id } = await params
  const supabase = getSupabaseClient()

  // 获取人物详情
  const { data: person, error } = await supabase
    .from('ai_hall_of_fame')
    .select('*')
    .eq('id', parseInt(id))
    .single()

  if (error || !person) {
    notFound()
  }

  // 增加浏览量
  await supabase
    .from('ai_hall_of_fame')
    .update({ view_count: (person.view_count || 0) + 1 })
    .eq('id', person.id)

  // 获取相关人物
  let relatedPeople: any[] = []
  
  if (person.category) {
    const { data: sameCategory } = await supabase
      .from('ai_hall_of_fame')
      .select('id, name, name_en, photo, title, summary, category')
      .eq('category', person.category)
      .neq('id', person.id)
      .limit(4)
    
    relatedPeople = sameCategory || []
  }

  // 如果不够4个，补充其他热门人物
  if (relatedPeople.length < 4) {
    const existingIds = relatedPeople.map(p => p.id)
    existingIds.push(person.id)
    
    const { data: morePeople } = await supabase
      .from('ai_hall_of_fame')
      .select('id, name, name_en, photo, title, summary, category')
      .not('id', 'in', `(${existingIds.join(',')})`)
      .order('view_count', { ascending: false })
      .limit(4 - relatedPeople.length)
    
    if (morePeople) {
      relatedPeople = [...relatedPeople, ...morePeople]
    }
  }

  return <PersonDetail person={person} relatedPeople={relatedPeople} />
}
