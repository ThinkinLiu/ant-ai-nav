'use client'

import NewsForm from '@/components/news/NewsForm'

export default function NewNewsPage() {
  return <NewsForm mode="create" returnUrl="/admin/news" />
}
