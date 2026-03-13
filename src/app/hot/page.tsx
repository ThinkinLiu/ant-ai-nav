import HotToolsClient from './client'

interface PageProps {
  searchParams: Promise<{ type?: string; page?: string }>
}

export default async function HotToolsPage({ searchParams }: PageProps) {
  try {
    const params = await searchParams
    const type = params.type || 'domestic'
    const pageStr = params.page || '1'
    const page = parseInt(pageStr, 10) || 1

    return <HotToolsClient initialType={type} initialPage={page} />
  } catch (error) {
    console.error('HotToolsPage error:', error)
    return <HotToolsClient initialType="domestic" initialPage={1} />
  }
}
