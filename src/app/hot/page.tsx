import { Suspense } from 'react'
import HotToolsClient from './client'

interface PageProps {
  searchParams: Promise<{ type?: string; page?: string }>
}

export default async function HotToolsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const type = params.type || 'domestic'
  const page = parseInt(params.page || '1')

  return (
    <Suspense fallback={<LoadingFallback />}>
      <HotToolsClient initialType={type} initialPage={page} />
    </Suspense>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="py-12 bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 dark:from-red-950/20 dark:via-orange-950/20 dark:to-yellow-950/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </div>
      </div>
    </div>
  )
}
