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
 * 从 URL 中提取域名
 * 支持多种格式：
 * - https://icons.duckduckgo.com/ip3/domain.com.ico
 * - https://www.example.com/path
 * - example.com
 */
function extractDomain(url: string | null | undefined): string | null {
  if (!url) return null
  
  try {
    // 1. 尝试匹配 DuckDuckGo 图标格式
    const duckDuckGoMatch = url.match(/icons\.duckduckgo\.com\/ip3\/([^/]+)/)
    if (duckDuckGoMatch) {
      return duckDuckGoMatch[1].replace(/\.ico$/, '')
    }
    
    // 2. 尝试解析完整 URL
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const urlObj = new URL(url)
      // 移除 www. 前缀
      return urlObj.hostname.replace(/^www\./, '')
    }
    
    // 3. 如果已经是域名格式（没有协议）
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
 * 工具Logo组件 - 自动处理图标加载失败的情况
 * 降级策略：
 * 1. 从 logo 字段提取域名，使用 IconHorse 服务（主要）- 国内访问稳定
 * 2. 如果 logo 为空，从 website 字段提取域名，使用 IconHorse 服务
 * 3. Splitbee Favicon 服务（备用）- 辅助
 * 4. 工具名称首字母（兜底）
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

  // 提取域名（优先从 logo，其次从 website）
  const domain = useMemo(() => {
    // 优先从 logo 字段提取
    const logoDomain = extractDomain(logo)
    if (logoDomain) return logoDomain
    
    // 如果 logo 为空或无法提取，尝试从 website 提取
    return extractDomain(website)
  }, [logo, website])

  // 生成主图标URL（使用IconHorse服务，国内访问稳定）
  const primaryLogo = useMemo(() => {
    if (!domain) return null
    return `https://icon.horse/icon/${domain}?size=${Math.max(size, 64)}`
  }, [domain, size])

  // 生成备用图标URL（使用Splitbee服务）
  const fallbackLogo = useMemo(() => {
    if (!domain) return null
    return `https://favicon.splitbee.io/?url=${domain}&size=${Math.max(size, 64)}`
  }, [domain, size])

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

  // 没有域名或所有尝试都失败
  if (!domain || (imgError && triedFallback)) {
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
      src={primaryLogo || ''}
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

  // 提取域名（优先从 logo，其次从 website）
  const domain = useMemo(() => {
    // 优先从 logo 字段提取
    const logoDomain = extractDomain(logo)
    if (logoDomain) return logoDomain
    
    // 如果 logo 为空或无法提取，尝试从 website 提取
    return extractDomain(website)
  }, [logo, website])

  // 生成主图标URL（使用IconHorse服务，国内访问稳定）
  const primaryLogo = useMemo(() => {
    if (!domain) return null
    return `https://icon.horse/icon/${domain}?size=${Math.max(size, 64)}`
  }, [domain, size])

  // 生成备用图标URL（使用Splitbee服务）
  const fallbackLogo = useMemo(() => {
    if (!domain) return null
    return `https://favicon.splitbee.io/?url=${domain}&size=${Math.max(size, 64)}`
  }, [domain, size])

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

  // 没有域名或所有尝试都失败
  if (!domain || (imgError && triedFallback)) {
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

  // 使用主图标服务（IconHorse）
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img 
      src={primaryLogo || ''}
      alt={name}
      className={className}
      width={size}
      height={size}
      onError={() => setImgError(true)}
    />
  )
}
