'use client'

import { useEffect } from 'react'

interface AnalyticsConfig {
  google_analytics_id?: string
  baidu_analytics_id?: string
  la_analytics_id?: string
}

export function AnalyticsScript() {
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const response = await fetch('/api/admin/seo')
        const data = await response.json()
        const config: AnalyticsConfig = data.data || {}

        // 加载 Google Analytics
        if (config.google_analytics_id) {
          loadGoogleAnalytics(config.google_analytics_id)
        }

        // 加载百度统计
        if (config.baidu_analytics_id) {
          loadBaiduAnalytics(config.baidu_analytics_id)
        }

        // 加载 51la 统计
        if (config.la_analytics_id) {
          load51LaAnalytics(config.la_analytics_id)
        }
      } catch (error) {
        console.error('加载统计脚本失败:', error)
      }
    }

    loadAnalytics()
  }, [])

  return null
}

// Google Analytics
function loadGoogleAnalytics(measurementId: string) {
  if (typeof window === 'undefined') return

  // 检查是否已加载
  if (typeof window.gtag === 'function') return

  // 插入脚本
  const script = document.createElement('script')
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  script.async = true
  document.head.appendChild(script)

  // 初始化
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag(...args: any[]) {
    window.dataLayer.push(args)
  }
  window.gtag('js', new Date())
  window.gtag('config', measurementId)
}

// 百度统计
function loadBaiduAnalytics(hmId: string) {
  if (typeof window === 'undefined') return

  // 检查是否已加载
  if (window._hmt) return

  window._hmt = window._hmt || []
  
  const script = document.createElement('script')
  script.src = `https://hm.baidu.com/hm.js?${hmId}`
  script.async = true
  document.head.appendChild(script)
}

// 51la 统计
function load51LaAnalytics(laId: string) {
  if (typeof window === 'undefined') return

  // 检查是否已加载
  if ((window as any).LA) return

  // 51la 新版SDK
  const script = document.createElement('script')
  script.id = 'LA_COLLECT'
  script.src = '//sdk.51.la/js-sdk-pro.min.js'
  script.async = true
  script.onload = () => {
    if ((window as any).LA) {
      (window as any).LA.init({ id: laId, ck: laId })
    }
  }
  document.head.appendChild(script)
}

// 声明全局类型
declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
    _hmt: any[]
  }
}
