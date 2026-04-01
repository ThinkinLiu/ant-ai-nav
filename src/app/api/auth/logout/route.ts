import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const client = getSupabaseClient(token)
      await client.auth.signOut()
    }

    return NextResponse.json({
      success: true,
      message: '已退出登录',
    })
  } catch (error) {
    console.error('退出登录错误:', error)
    return NextResponse.json({
      success: true,
      message: '已退出登录',
    })
  }
}
