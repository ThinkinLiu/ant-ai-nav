import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

/**
 * 获取发布者工具统计数据
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const publisherId = searchParams.get('publisherId')

    if (!publisherId) {
      return NextResponse.json(
        { success: false, error: '缺少发布者ID' },
        { status: 400 }
      )
    }

    const client = getSupabaseClient()

    // 使用SQL聚合直接统计各状态数量（避免Supabase 1000条限制）
    const { data: statusCounts, error } = await client
      .rpc('get_publisher_tool_stats', { p_publisher_id: publisherId })

    // 如果RPC不存在，使用备用方案
    if (error) {
      // 备用方案：分批获取所有数据
      const allStatuses: string[] = []
      let offset = 0
      const batchSize = 1000
      let hasMore = true

      while (hasMore) {
        const { data, error: fetchError } = await client
          .from('ai_tools')
          .select('status')
          .eq('publisher_id', publisherId)
          .range(offset, offset + batchSize - 1)

        if (fetchError || !data || data.length === 0) {
          hasMore = false
        } else {
          allStatuses.push(...data.map(t => t.status))
          if (data.length < batchSize) {
            hasMore = false
          } else {
            offset += batchSize
          }
        }
      }

      const stats = {
        total: allStatuses.length,
        pending: allStatuses.filter(s => s === 'pending').length,
        approved: allStatuses.filter(s => s === 'approved').length,
        rejected: allStatuses.filter(s => s === 'rejected').length,
      }

      return NextResponse.json({
        success: true,
        data: stats,
      })
    }

    // 使用RPC返回的结果
    const stats = {
      total: (statusCounts as any)?.total || 0,
      pending: (statusCounts as any)?.pending || 0,
      approved: (statusCounts as any)?.approved || 0,
      rejected: (statusCounts as any)?.rejected || 0,
    }

    return NextResponse.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error('获取统计数据错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
