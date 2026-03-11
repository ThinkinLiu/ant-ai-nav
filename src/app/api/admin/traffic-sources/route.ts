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
  
  // 如果数据库中有数据，返回数据库数据
  if (data && data.length > 0) {
    return NextResponse.json({ data })
  }
  
  // 如果没有配置，初始化默认数据源
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
  
  // 批量插入默认数据源
  const { data: insertedData, error: insertError } = await supabase
    .from('traffic_data_sources')
    .insert(defaultSources)
    .select()
  
  if (insertError) {
    console.error('初始化数据源失败:', insertError)
    // 即使插入失败也返回默认数据（无ID）
    return NextResponse.json({ data: defaultSources.map(s => ({ ...s, id: null })) })
  }
  
  return NextResponse.json({ data: insertedData || defaultSources })
}

// 更新数据源配置
export async function PUT(request: NextRequest) {
  const supabase = getSupabaseClient()
  const body = await request.json()
  
  // 如果有ID，直接更新
  if (body.id) {
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
        { error: '更新数据源配置失败: ' + error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ data })
  }
  
  // 如果没有ID，通过name查找
  if (body.name) {
    const { data: existing } = await supabase
      .from('traffic_data_sources')
      .select('*')
      .eq('name', body.name)
      .single()
    
    if (existing) {
      // 更新
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
        .eq('id', existing.id)
        .select()
        .single()
      
      if (error) {
        return NextResponse.json(
          { error: '更新数据源配置失败: ' + error.message },
          { status: 500 }
        )
      }
      
      return NextResponse.json({ data })
    } else {
      // 创建
      const { data, error } = await supabase
        .from('traffic_data_sources')
        .insert({
          name: body.name,
          display_name: body.display_name,
          api_key: body.api_key,
          api_endpoint: body.api_endpoint,
          is_active: body.is_active ?? false,
          priority: body.priority ?? 0,
          config: body.config
        })
        .select()
        .single()
      
      if (error) {
        return NextResponse.json(
          { error: '创建数据源配置失败: ' + error.message },
          { status: 500 }
        )
      }
      
      return NextResponse.json({ data })
    }
  }
  
  return NextResponse.json(
    { error: '缺少数据源ID或名称' },
    { status: 400 }
  )
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
