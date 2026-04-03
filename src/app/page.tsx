import { Suspense } from 'react'
import { SearchParamWrapper } from './home/SearchParamWrapper'

// 服务端组件
export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <SearchParamWrapper />
    </Suspense>
  )
}
