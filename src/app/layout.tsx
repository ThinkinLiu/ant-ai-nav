import type { Metadata, Viewport } from 'next'
import { Inspector } from 'react-dev-inspector'
import { Suspense } from 'react'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { AnalyticsScript } from '@/components/AnalyticsScript'
import { Toaster } from '@/components/ui/sonner'
import { OAuthCallbackHandler } from '@/components/OAuthCallbackHandler'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://mayiai.site'),
  title: {
    default: '蚂蚁AI导航 - 发现最好的AI工具',
    template: '%s | 蚂蚁AI导航',
  },
  description: '蚂蚁AI导航是一个专注于AI工具的资源导航平台，帮助用户发现和使用最优秀的AI产品。收录AI写作、AI绘画、AI对话、AI编程等海量工具。',
  keywords: [
    'AI导航',
    'AI工具',
    'AI工具导航',
    'AI写作',
    'AI绘画',
    'ChatGPT',
    'Claude',
    'Midjourney',
    '人工智能',
    'AI编程',
    'AI音频',
    'AI视频',
  ],
  authors: [{ name: '蚂蚁AI导航' }],
  creator: '蚂蚁AI导航',
  publisher: '蚂蚁AI导航',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/favicon-32x32.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  openGraph: {
    title: '蚂蚁AI导航 - 发现最好的AI工具',
    description: '蚂蚁AI导航是一个专注于AI工具的资源导航平台，帮助用户发现和使用最优秀的AI产品。',
    type: 'website',
    locale: 'zh_CN',
    siteName: '蚂蚁AI导航',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '蚂蚁AI导航',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '蚂蚁AI导航 - 发现最好的AI工具',
    description: '蚂蚁AI导航是一个专注于AI工具的资源导航平台，帮助用户发现和使用最优秀的AI产品。',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: '/',
  },
  category: 'technology',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const isDev = process.env.NODE_ENV === 'development'

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col" suppressHydrationWarning>
        {isDev && <Inspector />}
        <AnalyticsScript />
        <AuthProvider>
          <Suspense fallback={null}>
            <OAuthCallbackHandler />
          </Suspense>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  )
}
