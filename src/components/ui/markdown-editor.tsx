'use client'

import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils'

// 动态导入，避免SSR问题
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
)

// 动态导入 Markdown 预览组件
const MarkdownPreview = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default.Markdown),
  { ssr: false }
)

interface MarkdownEditorProps {
  value: string
  onChange: (value: string | undefined) => void
  height?: number
  preview?: 'edit' | 'live' | 'preview'
  className?: string
  label?: string
}

export function MarkdownEditor({
  value,
  onChange,
  height = 400,
  preview = 'live',
  className,
  label,
}: MarkdownEditorProps) {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="text-sm font-medium mb-2 block">
          {label}
        </label>
      )}
      <div data-color-mode="light">
        <MDEditor
          value={value}
          onChange={onChange}
          height={height}
          preview={preview}
          textareaProps={{
            placeholder: "支持 Markdown 格式...",
          }}
          visibleDragbar={false}
        />
      </div>
    </div>
  )
}

// 简化版本，用于只需要编辑不需要预览的场景
interface MarkdownEditorSimpleProps {
  value: string
  onChange: (value: string | undefined) => void
  placeholder?: string
  className?: string
  minHeight?: number
  label?: string
}

export function MarkdownEditorSimple({
  value,
  onChange,
  placeholder = "支持 Markdown 格式...",
  className,
  minHeight = 150,
  label,
}: MarkdownEditorSimpleProps) {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="text-sm font-medium mb-2 block">
          {label}
        </label>
      )}
      <div data-color-mode="light">
        <MDEditor
          value={value}
          onChange={onChange}
          height={minHeight}
          preview="edit"
          textareaProps={{
            placeholder: placeholder,
          }}
          visibleDragbar={false}
          hideToolbar={true}
        />
      </div>
    </div>
  )
}

// Markdown 渲染组件（只读）
interface MarkdownViewerProps {
  content: string
  className?: string
}

export function MarkdownViewer({ content, className }: MarkdownViewerProps) {
  if (!content) {
    return null
  }

  return (
    <div className={cn('prose prose-sm dark:prose-invert max-w-none', className)}>
      <div data-color-mode="light">
        <MarkdownPreview
          source={content}
          style={{
            backgroundColor: 'transparent',
            color: 'inherit',
          }}
        />
      </div>
    </div>
  )
}
