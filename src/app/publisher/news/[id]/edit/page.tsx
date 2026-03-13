'use client'

import { use } from 'react'
import NewsForm from '@/components/news/NewsForm'

export default function PublisherEditNewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <NewsForm mode="edit" newsId={parseInt(id)} returnUrl="/publisher/news" />
}
