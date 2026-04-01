'use client'

import { useState } from 'react'

interface AvatarProps {
  src: string | null
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

// 获取名字首字母（最多2个）
function getInitials(name: string): string {
  const parts = name.split(/[\s-]+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

export function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
  const [error, setError] = useState(false)
  
  const sizeClasses = {
    sm: 'w-12 h-12 text-lg',
    md: 'w-14 h-14 text-xl',
    lg: 'w-32 h-32 md:w-40 md:h-40 text-5xl',
  }

  // 如果没有图片或图片加载失败，显示名字首字母
  if (!src || error) {
    return (
      <div 
        className={`${sizeClasses[size]} rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-primary/30 flex items-center justify-center flex-shrink-0 ${className}`}
      >
        <span 
          className={`font-bold text-primary ${size === 'lg' ? 'text-4xl' : 'text-xl'}`}
        >
          {getInitials(name)}
        </span>
      </div>
    )
  }

  return (
    <div className={`${sizeClasses[size]} rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-primary/30 flex items-center justify-center flex-shrink-0 ${className}`}>
      <img
        src={src}
        alt={name}
        className="w-full h-full object-cover"
        onError={() => setError(true)}
      />
    </div>
  )
}

// 服务端可用的简单头像组件（用于精选人物展示）
interface FeaturedAvatarProps {
  src: string | null
  name: string
}

export function FeaturedAvatar({ src, name }: FeaturedAvatarProps) {
  return (
    <div className="w-14 h-14 mx-auto mb-2 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/30 flex items-center justify-center">
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <span className="text-lg font-bold text-primary">{getInitials(name)}</span>
      )}
    </div>
  )
}
