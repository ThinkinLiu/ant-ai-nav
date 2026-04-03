'use client'

import { useSearchParams } from 'next/navigation'
import { HomePageClient } from './HomePageClient'

export function SearchParamWrapper() {
  const searchParams = useSearchParams()

  const searchQuery = searchParams.get('search')
  const categoryId = searchParams.get('categoryId')
  const isFeatured = searchParams.get('isFeatured')

  return (
    <HomePageClient
      searchQuery={searchQuery}
      categoryId={categoryId}
      isFeatured={isFeatured}
    />
  )
}
