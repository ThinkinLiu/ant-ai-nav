import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const client = getSupabaseClient()

    // 尝试先按 ID 查询，如果失败则按 slug 查询
    let query = client
      .from('ai_tools')
      .select('*')
    
    // 判断是否为数字 ID
    const isNumericId = !isNaN(parseInt(id))
    
    if (isNumericId) {
      query = query.eq('id', parseInt(id))
    } else {
      // 按 slug 查询
      query = query.eq('slug', decodeURIComponent(id))
    }

    const { data: tool, error } = await query.single()

    if (error || !tool) {
      return NextResponse.json(
        { success: false, error: '工具不存在' },
        { status: 404 }
      )
    }

    // 增加浏览量
    await client
      .from('ai_tools')
      .update({ view_count: (tool.view_count || 0) + 1 })
      .eq('id', tool.id)

    // 获取分类信息
    const { data: category } = await client
      .from('categories')
      .select('*')
      .eq('id', tool.category_id)
      .single()

    // 获取发布者信息
    const { data: publisher } = await client
      .from('users')
      .select('*')
      .eq('id', tool.publisher_id)
      .single()

    // 获取标签 - 使用直接查询方式
    const { data: toolTags } = await client
      .from('tool_tags')
      .select('tag_id')
      .eq('tool_id', tool.id)

    let tags: any[] = []
    if (toolTags && toolTags.length > 0) {
      const tagIds = toolTags.map(tt => tt.tag_id)
      const { data: tagsData } = await client
        .from('tags')
        .select('id, name, slug')
        .in('id', tagIds)
      tags = tagsData || []
    }

    // 获取评论统计
    const { data: comments } = await client
      .from('comments')
      .select('rating')
      .eq('tool_id', tool.id)
      .not('rating', 'is', null)

    const ratings = comments?.map(c => c.rating).filter(Boolean) as number[] || []
    const avgRating = ratings.length > 0 
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
      : 0

    return NextResponse.json({
      success: true,
      data: {
        ...tool,
        category,
        publisher: publisher ? { ...publisher, password: undefined } : null,
        tags,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: comments?.length || 0,
      },
    })
  } catch (error) {
    console.error('获取工具详情错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const client = getSupabaseClient(token)

    // 获取当前用户
    const { data: { user } } = await client.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: '无效的登录状态' },
        { status: 401 }
      )
    }

    // 获取工具
    const { data: tool } = await client
      .from('ai_tools')
      .select('publisher_id')
      .eq('id', parseInt(id))
      .single()

    if (!tool) {
      return NextResponse.json(
        { success: false, error: '工具不存在' },
        { status: 404 }
      )
    }

    // 检查权限
    const { data: userData } = await client
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (tool.publisher_id !== user.id && userData?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: '无权限修改此工具' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    // 编辑后重置状态为待审核（除非是管理员明确指定状态）
    if (body.status && userData?.role === 'admin') {
      updateData.status = body.status
    } else if (body.name || body.description || body.website || body.categoryId) {
      // 如果修改了核心内容，重置为待审核
      updateData.status = 'pending'
      updateData.reject_reason = null
    }

    if (body.name) updateData.name = body.name
    if (body.description) updateData.description = body.description
    if (body.longDescription) updateData.long_description = body.longDescription
    if (body.website) updateData.website = body.website
    if (body.logo) updateData.logo = body.logo
    if (body.categoryId) updateData.category_id = body.categoryId
    if (body.isFree !== undefined) updateData.is_free = body.isFree
    if (body.pricingInfo) updateData.pricing_info = body.pricingInfo
    if (body.isFeatured !== undefined) updateData.is_featured = body.isFeatured
    if (body.isPinned !== undefined) updateData.is_pinned = body.isPinned
    if (body.rejectReason !== undefined) updateData.reject_reason = body.rejectReason

    // 更新工具
    const { data: updatedTool, error } = await client
      .from('ai_tools')
      .update(updateData)
      .eq('id', parseInt(id))
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    // 处理标签更新
    if (body.tags !== undefined) {
      const tags = Array.isArray(body.tags) 
        ? body.tags.filter((t: string) => t.trim()).map((t: string) => t.trim())
        : []
      
      // 删除旧的标签关联
      await client
        .from('tool_tags')
        .delete()
        .eq('tool_id', parseInt(id))
      
      if (tags.length > 0) {
        // 获取或创建标签
        const tagIds: number[] = []
        
        for (const tagName of tags) {
          // 查找现有标签
          const { data: existingTag } = await client
            .from('tags')
            .select('id')
            .eq('name', tagName)
            .single()
          
          if (existingTag) {
            tagIds.push(existingTag.id)
          } else {
            // 创建新标签
            const slug = tagName
              .toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/[^\w\u4e00-\u9fa5-]/g, '')
            
            const { data: newTag, error: createError } = await client
              .from('tags')
              .insert({ name: tagName, slug })
              .select('id')
              .single()
            
            if (!createError && newTag) {
              tagIds.push(newTag.id)
            }
          }
        }
        
        // 创建新的标签关联
        if (tagIds.length > 0) {
          const toolTagsData = tagIds.map(tagId => ({
            tool_id: parseInt(id),
            tag_id: tagId,
          }))
          
          await client
            .from('tool_tags')
            .insert(toolTagsData)
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedTool,
    })
  } catch (error) {
    console.error('更新工具错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const client = getSupabaseClient(token)

    const { data: { user } } = await client.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: '无效的登录状态' },
        { status: 401 }
      )
    }

    // 获取工具
    const { data: tool } = await client
      .from('ai_tools')
      .select('publisher_id')
      .eq('id', parseInt(id))
      .single()

    if (!tool) {
      return NextResponse.json(
        { success: false, error: '工具不存在' },
        { status: 404 }
      )
    }

    // 检查权限
    const { data: userData } = await client
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (tool.publisher_id !== user.id && userData?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: '无权限删除此工具' },
        { status: 403 }
      )
    }

    const { error } = await client
      .from('ai_tools')
      .delete()
      .eq('id', parseInt(id))

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '删除成功',
    })
  } catch (error) {
    console.error('删除工具错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
