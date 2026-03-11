import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 获取所有流量数据源配置
export async function GET() {
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase
    .from('traffic_data_sources')
    .select('*')
    .order('priority', { ascending: false })
  
  if (error) {
    return NextResponse.json(
      { error: '获取数据源配置失败' },
      { status: 500 }
    )
  }
  
  // 如果没有配置，返回默认支持的数据源
  if (!data || data.length === 0) {
    const defaultSources = [
      {
        name: 'similarweb',
        display_name: 'SimilarWeb',
        is_active: false,
        priority: 100,
        config: {
          description: 'SimilarWeb提供网站流量分析数据',
          required_fields: ['api_key'],
          api_documentation: 'https://developer.similarweb.com/',
          pricing: '付费API，有免费试用'
        }
      },
      {
        name: 'semrush',
        display_name: 'SEMrush',
        is_active: false,
        priority: 90,
        config: {
          description: 'SEMrush提供SEO和流量分析数据',
          required_fields: ['api_key'],
          api_documentation: 'https://www.semrush.com/api-documentation/',
          pricing: '付费API'
        }
      },
      {
        name: 'ahrefs',
        display_name: 'Ahrefs',
        is_active: false,
        priority: 80,
        config: {
          description: 'Ahrefs提供SEO和反向链接分析',
          required_fields: ['api_key'],
          api_documentation: 'https://ahrefs.com/api',
          pricing: '付费API'
        }
      },
      {
        name: 'mock',
        display_name: '模拟数据（默认）',
        is_active: true,
        priority: 0,
        config: {
          description: '使用模拟数据生成排行榜，用于测试和演示',
          required_fields: [],
          pricing: '免费'
        }
      }
    ]
    
    return NextResponse.json({ data: defaultSources })
  }
  
  return NextResponse.json({ data })
}

// 创建或更新数据源配置
export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient()
  const body = await request.json()
  
  const { data, error } = await supabase
    .from('traffic_data_sources')
    .upsert({
      name: body.name,
      display_name: body.display_name,
      api_key: body.api_key,
      api_endpoint: body.api_endpoint,
      is_active: body.is_active ?? false,
      priority: body.priority ?? 0,
      config: body.config,
      updated_at: new Date().toISOString()
    }, { onConflict: 'name' })
    .select()
    .single()
  
  if (error) {
    return NextResponse.json(
      { error: '保存数据源配置失败' },
      { status: 500 }
    )
  }
  
  return NextResponse.json({ data })
}

// 更新数据源配置
export async function PUT(request: NextRequest) {
  const supabase = getSupabaseClient()
  const body = await request.json()
  
  if (!body.id) {
    return NextResponse.json(
      { error: '缺少数据源ID' },
      { status: 400 }
    )
  }
  
  const { data, error } = await supabase
    .from('traffic_data_sources')
    .update({
      display_name: body.display_name,
      api_key: body.api_key,
      api_endpoint: body.api_endpoint,
      is_active: body.is_active,
      priority: body.priority,
      config: body.config,
      updated_at: new Date().toISOString()
    })
    .eq('id', body.id)
    .select()
    .single()
  
  if (error) {
    return NextResponse.json(
      { error: '更新数据源配置失败' },
      { status: 500 }
    )
  }
  
  return NextResponse.json({ data })
}

// 删除数据源配置
export async function DELETE(request: NextRequest) {
  const supabase = getSupabaseClient()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  
  if (!id) {
    return NextResponse.json(
      { error: '缺少数据源ID' },
      { status: 400 }
    )
  }
  
  const { error } = await supabase
    .from('traffic_data_sources')
    .delete()
    .eq('id', id)
  
  if (error) {
    return NextResponse.json(
      { error: '删除数据源配置失败' },
      { status: 500 }
    )
  }
  
  return NextResponse.json({ success: true })
}
