import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const client = getSupabaseClient()

    // 获取资讯详情
    const { data: news, error } = await client
      .from('ai_news')
      .select('*')
      .eq('id', parseInt(id))
      .single()

    if (error || !news) {
      return NextResponse.json(
        { success: false, error: '资讯不存在' },
        { status: 404 }
      )
    }

    // 增加浏览量
    await client
      .from('ai_news')
      .update({ view_count: (news.view_count || 0) + 1 })
      .eq('id', news.id)

    // 获取相关资讯（同分类或同标签）
    let relatedNews: any[] = []
    
    if (news.category) {
      const { data: sameCategory } = await client
        .from('ai_news')
        .select('id, title, summary, cover_image, category, published_at, view_count')
        .eq('category', news.category)
        .neq('id', news.id)
        .order('published_at', { ascending: false })
        .limit(5)
      
      relatedNews = sameCategory || []
    }

    // 如果不够5条，补充热门资讯
    if (relatedNews.length < 5) {
      const existingIds = relatedNews.map(n => n.id)
      existingIds.push(news.id)
      
      const { data: moreNews } = await client
        .from('ai_news')
        .select('id, title, summary, cover_image, category, published_at, view_count')
        .not('id', 'in', `(${existingIds.join(',')})`)
        .order('view_count', { ascending: false })
        .limit(5 - relatedNews.length)
      
      if (moreNews) {
        relatedNews = [...relatedNews, ...moreNews]
      }
    }

    // 获取上一篇和下一篇
    const { data: prevNews } = await client
      .from('ai_news')
      .select('id, title')
      .lt('published_at', news.published_at)
      .order('published_at', { ascending: false })
      .limit(1)
      .single()

    const { data: nextNews } = await client
      .from('ai_news')
      .select('id, title')
      .gt('published_at', news.published_at)
      .order('published_at', { ascending: true })
      .limit(1)
      .single()

    return NextResponse.json({
      success: true,
      data: {
        ...news,
        view_count: (news.view_count || 0) + 1,
        related: relatedNews,
        prev: prevNews,
        next: nextNews,
      },
    })
  } catch (error) {
    console.error('获取AI资讯详情错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
