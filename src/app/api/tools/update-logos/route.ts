import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

/**
 * 批量更新所有AI工具的官方logo
 * 使用DuckDuckGo Favicon服务获取网站图标（国内外均可访问）
 */
export async function POST(request: Request) {
  try {
    const client = getSupabaseClient()
    const body = await request.json().catch(() => ({}))
    const forceUpdate = body.force === true // 是否强制覆盖已有logo
    
    // 1. 分批获取所有工具（每批1000条，因为Supabase有限制）
    const allTools: Array<{ id: number; name: string; website: string | null; logo: string | null }> = []
    let offset = 0
    const batchSize = 1000
    let hasMore = true
    
    while (hasMore) {
      const { data: tools, error: fetchError } = await client
        .from('ai_tools')
        .select('id, name, website, logo')
        .order('id', { ascending: true })
        .range(offset, offset + batchSize - 1)

      if (fetchError) {
        return NextResponse.json(
          { success: false, error: fetchError.message },
          { status: 400 }
        )
      }

      if (!tools || tools.length === 0) {
        hasMore = false
      } else {
        allTools.push(...tools)
        if (tools.length < batchSize) {
          hasMore = false
        } else {
          offset += batchSize
        }
      }
    }

    if (allTools.length === 0) {
      return NextResponse.json(
        { success: false, error: '没有找到工具数据' },
        { status: 400 }
      )
    }

    // 2. 提取域名并生成logo URL
    const updates: Array<{ id: number; name: string; logo: string }> = []
    const skipped: Array<{ id: number; name: string; reason: string }> = []

    for (const tool of allTools) {
      // 如果已经有logo且不强制更新，跳过
      if (tool.logo && !forceUpdate) {
        skipped.push({ id: tool.id, name: tool.name, reason: '已有logo' })
        continue
      }

      // 如果没有网站，跳过
      if (!tool.website) {
        skipped.push({ id: tool.id, name: tool.name, reason: '没有网站' })
        continue
      }

      try {
        const url = new URL(tool.website)
        const domain = url.hostname
        
        // 使用DuckDuckGo Favicon服务获取logo（国内外均可访问）
        const logoUrl = `https://icons.duckduckgo.com/ip3/${domain}.ico`
        
        updates.push({
          id: tool.id,
          name: tool.name,
          logo: logoUrl
        })
      } catch {
        skipped.push({ id: tool.id, name: tool.name, reason: 'URL解析失败' })
      }
    }

    // 3. 批量更新数据库（每次50条）
    const updateBatchSize = 50
    let updatedCount = 0
    const errors: string[] = []

    for (let i = 0; i < updates.length; i += updateBatchSize) {
      const batch = updates.slice(i, i + updateBatchSize)
      
      for (const item of batch) {
        const { error: updateError } = await client
          .from('ai_tools')
          .update({ logo: item.logo })
          .eq('id', item.id)

        if (updateError) {
          errors.push(`${item.name}: ${updateError.message}`)
        } else {
          updatedCount++
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        total: allTools.length,
        updated: updatedCount,
        skipped: skipped.length,
        errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
        sample: updates.slice(0, 5).map(u => ({ name: u.name, logo: u.logo }))
      }
    })
  } catch (error) {
    console.error('更新logo失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
