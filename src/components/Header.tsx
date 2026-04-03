'use client'

import { Suspense } from 'react'
import { HeaderContent } from './HeaderContent'

export function Header() {
  return (
    <Suspense fallback={<HeaderFallback />}>
      <HeaderContent />
    </Suspense>
  )
}

function HeaderFallback() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
          <div className="h-6 w-24 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-9 w-64 rounded-full bg-muted animate-pulse hidden md:block" />
        <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
      </div>
    </header>
  )
}
