'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'

interface ToolLogoProps {
  logo: string | null
  name: string
  className?: string
  size?: number
  fallbackBgColor?: string
}

/**
 * 工具Logo组件 - 自动处理图标加载失败的情况
 * 降级策略：
 * 1. IconHorse服务（主要）- 国内访问稳定
 * 2. Splitbee Favicon服务（备用）- 辅助
 * 3. 工具名称首字母（兜底）
 */
export function ToolLogo({ 
  logo, 
  name, 
  className = '', 
  size = 48,
  fallbackBgColor 
}: ToolLogoProps) {
  const [imgError, setImgError] = useState(false)
  const [triedFallback, setTriedFallback] = useState(false)

  // 生成主图标URL（使用IconHorse服务，国内访问稳定）
  const primaryLogo = useMemo(() => {
    if (!logo) return null
    
    // 从原始logo URL中提取域名
    try {
      // DuckDuckGo格式: https://icons.duckduckgo.com/ip3/domain.com.ico
      const match = logo.match(/icons\.duckduckgo\.com\/ip3\/([^/]+)/)
      if (match) {
        const domain = match[1].replace(/\.ico$/, '')
        // 使用IconHorse服务（国内可访问）
        return `https://icon.horse/icon/${domain}?size=${Math.max(size, 64)}`
      }
    } catch {
      // ignore
    }
    return null
  }, [logo, size])

  // 生成备用图标URL（使用Splitbee服务）
  const fallbackLogo = useMemo(() => {
    if (!logo) return null
    
    try {
      const match = logo.match(/icons\.duckduckgo\.com\/ip3\/([^/]+)/)
      if (match) {
        const domain = match[1].replace(/\.ico$/, '')
        // 使用Splitbee Favicon服务作为备用
        return `https://favicon.splitbee.io/?url=${domain}&size=${Math.max(size, 64)}`
      }
    } catch {
      // ignore
    }
    return null
  }, [logo, size])

  // 生成基于名称的背景色
  const bgColor = useMemo(() => {
    if (fallbackBgColor) return fallbackBgColor
    // 基于名称生成一致的颜色
    const colors = [
      '#EF4444', '#F97316', '#F59E0B', '#EAB308', 
      '#84CC16', '#22C55E', '#10B981', '#14B8A6',
      '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
      '#8B5CF6', '#A855F7', '#D946EF', '#EC4899'
    ]
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }, [name, fallbackBgColor])

  // 没有logo或所有尝试都失败
  if (!logo || (imgError && triedFallback)) {
    return (
      <div 
        className={`flex items-center justify-center text-white font-bold ${className}`}
        style={{ backgroundColor: bgColor }}
      >
        {name[0]?.toUpperCase() || '?'}
      </div>
    )
  }

  // 尝试备用图标（Splitbee）
  if (imgError && fallbackLogo && !triedFallback) {
    return (
      <img 
        src={fallbackLogo}
        alt={name}
        className={className}
        onError={() => setTriedFallback(true)}
      />
    )
  }

  // 使用主图标服务（IconHorse）
  return (
    <img 
      src={primaryLogo || logo}
      alt={name}
      className={className}
      onError={() => setImgError(true)}
    />
  )
}

/**
 * 工具Logo组件 - 带Next.js Image优化的版本
 */
export function ToolLogoNext({ 
  logo, 
  name, 
  className = '', 
  size = 48,
  fallbackBgColor 
}: ToolLogoProps) {
  const [imgError, setImgError] = useState(false)
  const [triedFallback, setTriedFallback] = useState(false)

  // 生成主图标URL（使用IconHorse服务，国内访问稳定）
  const primaryLogo = useMemo(() => {
    if (!logo) return null
    
    try {
      const match = logo.match(/icons\.duckduckgo\.com\/ip3\/([^/]+)/)
      if (match) {
        const domain = match[1].replace(/\.ico$/, '')
        return `https://icon.horse/icon/${domain}?size=${Math.max(size, 64)}`
      }
    } catch {
      // ignore
    }
    return null
  }, [logo, size])

  // 生成备用图标URL（使用Splitbee服务）
  const fallbackLogo = useMemo(() => {
    if (!logo) return null
    
    try {
      const match = logo.match(/icons\.duckduckgo\.com\/ip3\/([^/]+)/)
      if (match) {
        const domain = match[1].replace(/\.ico$/, '')
        return `https://favicon.splitbee.io/?url=${domain}&size=${Math.max(size, 64)}`
      }
    } catch {
      // ignore
    }
    return null
  }, [logo, size])

  // 生成基于名称的背景色
  const bgColor = useMemo(() => {
    if (fallbackBgColor) return fallbackBgColor
    const colors = [
      '#EF4444', '#F97316', '#F59E0B', '#EAB308', 
      '#84CC16', '#22C55E', '#10B981', '#14B8A6',
      '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
      '#8B5CF6', '#A855F7', '#D946EF', '#EC4899'
    ]
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }, [name, fallbackBgColor])

  // 没有logo或所有尝试都失败
  if (!logo || (imgError && triedFallback)) {
    return (
      <div 
        className={`flex items-center justify-center text-white font-bold ${className}`}
        style={{ backgroundColor: bgColor, width: size, height: size }}
      >
        {name[0]?.toUpperCase() || '?'}
      </div>
    )
  }

  // 尝试备用图标（Splitbee）
  if (imgError && fallbackLogo && !triedFallback) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img 
        src={fallbackLogo}
        alt={name}
        className={className}
        width={size}
        height={size}
        onError={() => setTriedFallback(true)}
      />
    )
  }

  // 使用主图标服务（IconHorse）- 外部URL使用普通img标签
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img 
      src={primaryLogo || logo}
      alt={name}
      className={className}
      width={size}
      height={size}
      onError={() => setImgError(true)}
    />
  )
}

export default ToolLogo
