'use client'

import { useState, useRef, useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  className?: string
  maxTags?: number
}

export function TagInput({ 
  value = [], 
  onChange, 
  placeholder = '输入标签，按回车或逗号分隔',
  className,
  maxTags 
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // 将字符串数组转换为显示用的标签
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  // 处理标签分隔（回车、中文逗号、英文逗号）
  const handleTagSeparation = (text: string) => {
    // 使用正则匹配中文逗号、英文逗号、换行符
    const tags = text.split(/[,，\n]/).map(t => t.trim()).filter(Boolean)
    
    if (tags.length > 0) {
      const newTags = [...value]
      tags.forEach(tag => {
        // 检查是否超过最大标签数量
        if (maxTags && newTags.length >= maxTags) {
          return
        }
        // 检查是否已存在
        if (!newTags.includes(tag)) {
          newTags.push(tag)
        }
      })
      onChange(newTags)
    }
  }

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 回车键添加标签
    if (e.key === 'Enter') {
      e.preventDefault()
      if (inputValue.trim()) {
        handleTagSeparation(inputValue)
        setInputValue('')
      }
    }
    // 退格键删除最后一个标签
    else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1))
    }
    // 中文逗号或英文逗号自动分隔
    else if (e.key === ',' || e.key === '，') {
      e.preventDefault()
      if (inputValue.trim()) {
        handleTagSeparation(inputValue)
        setInputValue('')
      }
    }
  }

  // 失去焦点时，如果有输入内容，自动添加为标签
  const handleBlur = () => {
    if (inputValue.trim()) {
      handleTagSeparation(inputValue)
      setInputValue('')
    }
  }

  // 删除标签
  const removeTag = (indexToRemove: number) => {
    onChange(value.filter((_, index) => index !== indexToRemove))
  }

  return (
    <div className={cn(
      'flex flex-wrap gap-2 p-2 min-h-10 border rounded-md bg-background focus-within:ring-2 focus-within:ring-ring focus-within:border-transparent',
      className
    )}>
      {/* 已有标签 */}
      {value.map((tag, index) => (
        <div
          key={index}
          className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-primary/10 text-primary rounded-md group hover:bg-primary/20 transition-colors"
        >
          <span>{tag}</span>
          <button
            type="button"
            onClick={() => removeTag(index)}
            className="ml-1 text-primary/60 hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded"
            tabIndex={-1}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}

      {/* 输入框 */}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={value.length === 0 ? placeholder : ''}
        className={cn(
          'flex-1 min-w-[120px] outline-none text-sm bg-transparent placeholder:text-muted-foreground',
          // 达到最大标签数时隐藏输入框
          maxTags && value.length >= maxTags && 'hidden'
        )}
      />

      {/* 达到最大标签数提示 */}
      {maxTags && value.length >= maxTags && (
        <span className="text-xs text-muted-foreground">
          已达最大标签数 {maxTags}
        </span>
      )}
    </div>
  )
}
