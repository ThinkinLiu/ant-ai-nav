'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageUploaderProps {
  value?: string
  onChange: (url: string) => void
  folder?: string
  className?: string
  placeholder?: string
  aspectRatio?: 'square' | 'circle'
  maxSize?: number // MB
}

export default function ImageUploader({
  value,
  onChange,
  folder = 'uploads',
  className,
  placeholder = '点击上传图片',
  aspectRatio = 'square',
  maxSize = 5,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (file: File) => {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件')
      return
    }

    // 验证文件大小
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`图片大小不能超过 ${maxSize}MB`)
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success && result.data?.url) {
        onChange(result.data.url)
        toast.success('上传成功')
      } else {
        toast.error(result.error || '上传失败')
      }
    } catch (error) {
      console.error('上传失败:', error)
      toast.error('上传失败，请重试')
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleUpload(file)
    }
    // 清空 input 以便重复选择同一文件
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
  }

  return (
    <div className={cn('relative', className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
      />
      
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'relative cursor-pointer border-2 border-dashed rounded-lg transition-all duration-200',
          'hover:border-primary/50 hover:bg-muted/50',
          dragOver && 'border-primary bg-muted/50',
          aspectRatio === 'circle' ? 'w-24 h-24 rounded-full' : 'w-full h-40',
          uploading && 'opacity-50 cursor-not-allowed'
        )}
      >
        {value ? (
          <div className="relative w-full h-full">
            <img
              src={value}
              alt="预览"
              className={cn(
                'object-cover w-full h-full',
                aspectRatio === 'circle' ? 'rounded-full' : 'rounded-lg'
              )}
            />
            {!uploading && (
              <button
                onClick={handleRemove}
                className={cn(
                  'absolute bg-red-500 text-white rounded-full p-1 shadow-lg',
                  'hover:bg-red-600 transition-colors',
                  aspectRatio === 'circle' 
                    ? 'top-0 right-0 w-6 h-6 flex items-center justify-center'
                    : 'top-2 right-2'
                )}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className={cn(
            'flex flex-col items-center justify-center h-full text-muted-foreground',
            aspectRatio === 'circle' ? 'p-2' : 'p-4'
          )}>
            {uploading ? (
              <>
                <Loader2 className={cn('animate-spin', aspectRatio === 'circle' ? 'w-6 h-6' : 'w-8 h-8')} />
                <span className={cn('mt-2', aspectRatio === 'circle' ? 'text-xs' : 'text-sm')}>上传中...</span>
              </>
            ) : (
              <>
                {aspectRatio === 'circle' ? (
                  <ImageIcon className="w-8 h-8" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 mb-2" />
                    <span className="text-sm">{placeholder}</span>
                    <span className="text-xs mt-1 text-muted-foreground">
                      支持 JPG、PNG、GIF，最大 {maxSize}MB
                    </span>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
