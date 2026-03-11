import type { Metadata } from 'next'
import { Inspector } from 'react-dev-inspector'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export const metadata: Metadata = {
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
  ],
  authors: [{ name: '蚂蚁AI导航' }],
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: '蚂蚁AI导航 - 发现最好的AI工具',
    description: '蚂蚁AI导航是一个专注于AI工具的资源导航平台，帮助用户发现和使用最优秀的AI产品。',
    type: 'website',
    locale: 'zh_CN',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const isDev = process.env.NODE_ENV === 'development'

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col">
        {isDev && <Inspector />}
        <AuthProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}
