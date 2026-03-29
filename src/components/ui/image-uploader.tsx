import * as React from "react"
import { cn } from "@/lib/utils"

interface ImageUploaderProps {
  value: string
  onChange: (value: string) => void
  className?: string
  maxSize?: number // in MB
  folder?: string
  aspectRatio?: string
  placeholder?: string
}

function ImageUploader({
  value,
  onChange,
  className,
  maxSize = 5,
  folder,
  aspectRatio,
  placeholder,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = React.useState(false)
  const [error, setError] = React.useState<string>("")

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

    try {
      // 这里应该调用上传 API，暂时使用 base64
      const base64 = await fileToBase64(file)
      onChange(base64)
    } catch (err) {
      setError("上传失败，请重试")
    } finally {
      setIsUploading(false)
    }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
    })
  }

  const handleRemove = () => {
    onChange("")
    setError("")
  }

  return (
    <div className={cn("space-y-2", className)}>
      {value ? (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Uploaded"
            className="h-32 w-32 rounded-lg object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground hover:bg-destructive/80"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-input p-8">
          <div className="text-center">
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploading}
              className="hidden"
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer text-sm text-muted-foreground hover:text-foreground"
            >
              {isUploading ? "上传中..." : "点击上传图片"}
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
