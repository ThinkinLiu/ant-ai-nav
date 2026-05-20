'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// 动态导入 HeaderContent 并禁用 SSR，避免 Coze 平台 data-inspector-* 属性导致的 hydration mismatch
const HeaderContent = dynamic(
  () => import('./HeaderContent').then((mod) => mod.HeaderContent),
  { 
    ssr: false,
    loading: () => <HeaderFallback />
  }
)

// Header 加载时的骨架屏
function HeaderFallback() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
          <div className="h-6 w-24 bg-muted animate-pulse rounded" />
        </div>
        <div className="hidden md:flex items-center space-x-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-4 w-16 bg-muted animate-pulse rounded" />
          ))}
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-8 w-16 bg-muted animate-pulse rounded" />
          <div className="h-8 w-16 bg-muted animate-pulse rounded" />
        </div>
      </div>
    </header>
  )
}

export function Header() {
  return <HeaderContent />
}
