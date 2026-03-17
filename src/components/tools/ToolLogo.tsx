'use client'

import { useState, useMemo } from 'react'

interface ToolLogoProps {
  logo: string | null
  name: string
  website?: string | null
  className?: string
  size?: number
  fallbackBgColor?: string
}

/**
 * 检查是否为 DuckDuckGo 图标格式
 */
function isDuckDuckGoFormat(url: string | null | undefined): boolean {
  if (!url) return false
  return url.includes('icons.duckduckgo.com/ip3/')
}

/**
 * 从 DuckDuckGo URL 中提取域名
 */
function extractDomainFromDuckDuckGo(url: string): string | null {
  const match = url.match(/icons\.duckduckgo\.com\/ip3\/([^/]+)/)
  if (match) {
    return match[1].replace(/\.ico$/, '')
  }
  return null
}

/**
 * 从 URL 中提取域名
 */
function extractDomain(url: string | null | undefined): string | null {
  if (!url) return null
  
  try {
    // 如果是 DuckDuckGo 格式，提取域名
    if (isDuckDuckGoFormat(url)) {
      return extractDomainFromDuckDuckGo(url)
    }
    
    // 尝试解析完整 URL
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const urlObj = new URL(url)
      return urlObj.hostname.replace(/^www\./, '')
    }
    
    // 如果已经是域名格式（没有协议）
    const domainMatch = url.match(/^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}/)
    if (domainMatch) {
      return url.replace(/^www\./, '')
    }
    
    return null
  } catch {
    return null
  }
}

/**
 * 判断 logo 是否需要使用域名生成图标服务
 * 只有以下情况才使用域名生成：
 * 1. logo 为 null 或空字符串
 * 2. logo 是 DuckDuckGo 格式
 */
function shouldUseDomainService(logo: string | null | undefined): boolean {
  if (!logo || logo.trim() === '') return true
  return isDuckDuckGoFormat(logo)
}

/**
 * 工具Logo组件 - 根据logo字段类型决定图标来源
 * 
 * 逻辑：
 * 1. 如果 logo 为空/null/DuckDuckGo格式：从 website 提取域名，使用图标服务生成
 * 2. 否则：直接使用 logo 字段的 URL
 * 3. 加载失败时：依次尝试备用图标服务 -> 首字母头像
 */
export function ToolLogo({ 
  logo, 
  name,
  website,
  className = '', 
  size = 48,
  fallbackBgColor 
}: ToolLogoProps) {
  const [imgError, setImgError] = useState(false)
  const [triedFallback, setTriedFallback] = useState(false)

  // 判断是否需要使用域名服务
  const useDomainService = useMemo(() => shouldUseDomainService(logo), [logo])

  // 提取域名（仅当需要使用域名服务时）
  const domain = useMemo(() => {
    if (!useDomainService) return null
    
    // 如果是 DuckDuckGo 格式，从 logo 提取域名
    if (isDuckDuckGoFormat(logo)) {
      const extracted = extractDomainFromDuckDuckGo(logo as string)
      if (extracted) return extracted
    }
    
    // 否则从 website 提取域名
    return extractDomain(website)
  }, [useDomainService, logo, website])

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

  // 首字母头像（最终兜底）
  const renderFallback = () => (
    <div 
      className={`flex items-center justify-center text-white font-bold ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      {name[0]?.toUpperCase() || '?'}
    </div>
  )

  // 情况1：直接使用 logo URL（非 DuckDuckGo 格式，非空）
  if (!useDomainService && logo) {
    // 加载失败，显示首字母
    if (imgError) {
      return renderFallback()
    }
    
    return (
      <img 
        src={logo}
        alt={name}
        className={className}
        onError={() => setImgError(true)}
      />
    )
  }

  // 情况2：使用域名服务生成图标
  if (!domain) {
    return renderFallback()
  }

  // 所有尝试都失败
  if (imgError && triedFallback) {
    return renderFallback()
  }

  // 主图标URL（IconHorse）
  const primaryLogo = `https://icon.horse/icon/${domain}?size=${Math.max(size, 64)}`
  
  // 备用图标URL（Splitbee）
  const fallbackLogo = `https://favicon.splitbee.io/?url=${domain}&size=${Math.max(size, 64)}`

  // 尝试备用图标
  if (imgError && !triedFallback) {
    return (
      <img 
        src={fallbackLogo}
        alt={name}
        className={className}
        onError={() => setTriedFallback(true)}
      />
    )
  }

  // 使用主图标服务
  return (
    <img 
      src={primaryLogo}
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
  website,
  className = '', 
  size = 48,
  fallbackBgColor 
}: ToolLogoProps) {
  const [imgError, setImgError] = useState(false)
  const [triedFallback, setTriedFallback] = useState(false)

  // 判断是否需要使用域名服务
  const useDomainService = useMemo(() => shouldUseDomainService(logo), [logo])

  // 提取域名（仅当需要使用域名服务时）
  const domain = useMemo(() => {
    if (!useDomainService) return null
    
    // 如果是 DuckDuckGo 格式，从 logo 提取域名
    if (isDuckDuckGoFormat(logo)) {
      const extracted = extractDomainFromDuckDuckGo(logo as string)
      if (extracted) return extracted
    }
    
    // 否则从 website 提取域名
    return extractDomain(website)
  }, [useDomainService, logo, website])

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

  // 首字母头像（最终兜底）
  const renderFallback = () => (
    <div 
      className={`flex items-center justify-center text-white font-bold ${className}`}
      style={{ backgroundColor: bgColor, width: size, height: size }}
    >
      {name[0]?.toUpperCase() || '?'}
    </div>
  )

  // 情况1：直接使用 logo URL（非 DuckDuckGo 格式，非空）
  if (!useDomainService && logo) {
    // 加载失败，显示首字母
    if (imgError) {
      return renderFallback()
    }
    
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img 
        src={logo}
        alt={name}
        className={className}
        width={size}
        height={size}
        onError={() => setImgError(true)}
      />
    )
  }

  // 情况2：使用域名服务生成图标
  if (!domain) {
    return renderFallback()
  }

  // 所有尝试都失败
  if (imgError && triedFallback) {
    return renderFallback()
  }

  // 主图标URL（IconHorse）
  const primaryLogo = `https://icon.horse/icon/${domain}?size=${Math.max(size, 64)}`
  
  // 备用图标URL（Splitbee）
  const fallbackLogo = `https://favicon.splitbee.io/?url=${domain}&size=${Math.max(size, 64)}`

  // 尝试备用图标
  if (imgError && !triedFallback) {
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

  // 使用主图标服务
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img 
      src={primaryLogo}
      alt={name}
      className={className}
      width={size}
      height={size}
      onError={() => setImgError(true)}
    />
  )
}
