'use client'

import NewsForm from '@/components/news/NewsForm'

export default function PublisherNewNewsPage() {
  return <NewsForm mode="create" returnUrl="/publisher/news" />
}
