import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 批量导入AI资讯
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { newsItems } = body

    if (!newsItems || !Array.isArray(newsItems) || newsItems.length === 0) {
      return NextResponse.json(
        { success: false, error: '资讯数据不能为空' },
        { status: 400 }
      )
    }

    const client = getSupabaseClient()
    const importedNews: any[] = []
    const errors: string[] = []

    for (const item of newsItems) {
      try {
        // 检查是否已存在相同标题的资讯
        const { data: existing } = await client
          .from('ai_news')
          .select('id')
          .eq('title', item.title)
          .single()

        if (existing) {
          errors.push(`"${item.title}" 已存在，跳过导入`)
          continue
        }

        // 插入新资讯
        const { data, error } = await client
          .from('ai_news')
          .insert({
            title: item.title,
            title_en: item.title_en || '',
            summary: item.summary,
            content: item.content,
            source: item.source,
            source_url: item.source_url,
            author: item.author || item.source,
            category: item.category || '行业动态',
            tags: item.tags || [],
            cover_image: item.cover_image || '',
            is_featured: item.is_featured || false,
            is_hot: item.is_hot || false,
            view_count: 0,
            like_count: 0,
            published_at: item.published_at || new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (error) {
          errors.push(`"${item.title}" 导入失败: ${error.message}`)
        } else {
          importedNews.push(data)
        }
      } catch (e: any) {
        errors.push(`"${item.title}" 导入异常: ${e.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        imported: importedNews,
        importedCount: importedNews.length,
        totalAttempted: newsItems.length,
        errors: errors,
      },
    })
  } catch (error) {
    console.error('批量导入AI资讯错误:', error)
    return NextResponse.json(
      { success: false, error: '导入失败，请稍后重试' },
      { status: 500 }
    )
  }
}
