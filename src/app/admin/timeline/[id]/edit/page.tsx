'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import TimelineForm, { TimelineFormData } from '@/components/timeline/TimelineForm'

export default function EditTimelinePage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<Partial<TimelineFormData>>()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/timeline/${params.id}`)
        const result = await response.json()

        if (result.success && result.data) {
          // 转换数据格式
          setData({
            year: result.data.year,
            month: result.data.month,
            day: result.data.day,
            title: result.data.title,
            titleEn: result.data.title_en,
            description: result.data.description,
            category: result.data.category,
            importance: result.data.importance,
            icon: result.data.icon,
            image: result.data.image,
            relatedPersonId: result.data.related_person_id,
            relatedUrl: result.data.related_url,
            tags: result.data.tags || [],
          })
        } else {
          toast.error('数据不存在')
          router.push('/admin/timeline')
        }
      } catch (error) {
        console.error('获取数据失败:', error)
        toast.error('获取数据失败')
        router.push('/admin/timeline')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">编辑AI大事纪</h1>
        <p className="text-muted-foreground mt-2">
          修改事件信息
        </p>
      </div>

      <TimelineForm mode="edit" initialData={data} id={parseInt(params.id as string)} />
    </div>
  )
}
