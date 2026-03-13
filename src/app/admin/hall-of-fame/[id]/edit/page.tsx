'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import HallOfFameForm, { HallOfFameFormData } from '@/components/hall-of-fame/HallOfFameForm'

export default function EditHallOfFamePage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<Partial<HallOfFameFormData>>()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/hall-of-fame/${params.id}`)
        const result = await response.json()

        if (result.success && result.data) {
          // 转换数据格式
          setData({
            name: result.data.name,
            nameEn: result.data.name_en,
            photo: result.data.photo,
            title: result.data.title,
            summary: result.data.summary,
            bio: result.data.bio,
            achievements: result.data.achievements || [],
            organization: result.data.organization,
            organizationUrl: result.data.organization_url,
            country: result.data.country,
            category: result.data.category,
            tags: result.data.tags || [],
            isFeatured: result.data.is_featured,
            birthYear: result.data.birth_year,
            deathYear: result.data.death_year,
          })
        } else {
          toast.error('数据不存在')
          router.push('/admin/hall-of-fame')
        }
      } catch (error) {
        console.error('获取数据失败:', error)
        toast.error('获取数据失败')
        router.push('/admin/hall-of-fame')
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
        <h1 className="text-3xl font-bold">编辑AI名人</h1>
        <p className="text-muted-foreground mt-2">
          修改人物信息
        </p>
      </div>

      <HallOfFameForm mode="edit" initialData={data} id={parseInt(params.id as string)} />
    </div>
  )
}
