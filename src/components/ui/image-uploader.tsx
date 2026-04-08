import * as React from "react"
import { cn } from "@/lib/utils"
import { Upload, X, Loader2 } from "lucide-react"

interface ImageUploaderProps {
  value: string
  onChange: (value: string) => void
  className?: string
  maxSize?: number // in MB
  folder?: string
  aspectRatio?: string
  placeholder?: string
  accept?: string
}

function ImageUploader({
  value,
  onChange,
  className,
  maxSize = 5,
  folder = 'uploads',
  aspectRatio,
  placeholder = "点击上传图片",
  accept = "image/*"
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = React.useState(false)
  const [error, setError] = React.useState<string>("")
  const [uploadProgress, setUploadProgress] = React.useState(0)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 验证文件大小
    if (file.size > maxSize * 1024 * 1024) {
      setError(`文件大小不能超过 ${maxSize}MB`)
      return
    }

    // 验证文件类型
    if (!file.type.startsWith("image/")) {
      setError("请上传图片文件")
      return
    }

    setError("")
    setIsUploading(true)
    setUploadProgress(0)

    try {
      // 创建 FormData
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      // 模拟进度
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 100)

      // 调用上传 API
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const result = await response.json()

      if (result.success && result.data) {
        onChange(result.data.url)
        setError("")
      } else {
        setError(result.error || '上传失败，请重试')
      }
    } catch (err) {
      setError("上传失败，请重试")
      console.error('Upload error:', err)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleRemove = () => {
    onChange("")
    setError("")
  }

  return (
    <div className={cn("space-y-2", className)}>
      {value ? (
        <div className="relative inline-block group">
          <img
            src={value}
            alt="Uploaded"
            className={`rounded-lg object-cover ${aspectRatio ? 'w-full' : 'h-32 w-32'}`}
            style={aspectRatio ? { aspectRatio } : undefined}
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
            <button
              type="button"
              onClick={handleRemove}
              className="bg-destructive text-destructive-foreground p-2 rounded-full hover:bg-destructive/90"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-input p-8 hover:border-primary/50 transition-colors">
          <div className="text-center">
            <input
              type="file"
              id="image-upload"
              accept={accept}
              onChange={handleFileChange}
              disabled={isUploading}
              className="hidden"
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer"
            >
              {isUploading ? (
                <div className="flex flex-col items-center space-y-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">上传中... {uploadProgress}%</span>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground hover:text-foreground">{placeholder}</span>
                  <span className="text-xs text-muted-foreground">最大 {maxSize}MB</span>
                </div>
              )}
            </label>
          </div>
        </div>
      )}
      {error && (
        <p className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

export default ImageUploader
