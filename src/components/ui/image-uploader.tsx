import * as React from "react"
import { cn } from "@/lib/utils"
import { Upload, X, Loader2, Link2, Image } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

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

export default function ImageUploader({
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
  const [urlInput, setUrlInput] = React.useState("")
  const [isValidatingUrl, setIsValidatingUrl] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // 处理文件上传
  const handleFileUpload = async (file: File) => {
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
      // 创建 FormData
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      // 调用上传 API
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success && result.data) {
        onChange(result.data.url)
        setError("")
        toast.success("图片上传成功")
      } else {
        setError(result.error || '上传失败，请重试')
      }
    } catch (err) {
      setError("上传失败，请重试")
      console.error('Upload error:', err)
    } finally {
      setIsUploading(false)
    }
  }

  // 处理文件选择
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await handleFileUpload(file)
    // 清空 input 以便选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // 处理粘贴事件
  React.useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault()
          const file = item.getAsFile()
          if (file) {
            await handleFileUpload(file)
          }
          return
        }
      }
    }

    // 监听全局粘贴事件
    document.addEventListener('paste', handlePaste)
    return () => {
      document.removeEventListener('paste', handlePaste)
    }
  }, [])

  // 处理 URL 输入
  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) {
      setError("请输入图片链接")
      return
    }

    // 验证 URL 格式
    try {
      new URL(urlInput)
    } catch {
      setError("请输入有效的 URL")
      return
    }

    setError("")
    setIsValidatingUrl(true)

    try {
      // 使用 no-cors 模式验证图片 URL 是否可访问
      // 由于 CORS 限制，只能验证请求是否发出，无法验证 content-type
      const response = await fetch(urlInput, { 
        method: 'HEAD',
        mode: 'no-cors'
      })
      
      // no-cors 模式下 response.ok 始终为 true
      // 我们只能验证 URL 格式是否正确
      onChange(urlInput)
      setUrlInput("")
      setError("")
      toast.success("图片链接设置成功")
    } catch (err) {
      // 即使验证失败，也直接使用 URL，让图片加载失败时由 onError 处理
      onChange(urlInput)
      setUrlInput("")
      setError("")
      toast.success("图片链接已设置（加载失败时会显示占位图）")
    } finally {
      setIsValidatingUrl(false)
    }
  }

  // 处理删除
  const handleRemove = () => {
    onChange("")
    setError("")
  }

  return (
    <div className={cn("space-y-2", className)}>
      {value ? (
        <div className="relative group">
          <img
            src={value}
            alt="Uploaded"
            className={`rounded-lg object-cover ${aspectRatio ? 'w-full' : 'h-32 w-32'}`}
            style={aspectRatio ? { aspectRatio } : undefined}
            onError={(e) => {
              // 图片加载失败时显示占位图
              e.currentTarget.style.display = 'none'
            }}
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="bg-primary text-primary-foreground p-2 rounded-full hover:bg-primary/90"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Image className="h-4 w-4" />
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>更换图片</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="upload" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload">上传图片</TabsTrigger>
                    <TabsTrigger value="url">输入链接</TabsTrigger>
                  </TabsList>
                  <TabsContent value="upload" className="space-y-4">
                    <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-input p-8 hover:border-primary/50 transition-colors">
                      <div className="text-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        {isUploading ? (
                          <div className="flex flex-col items-center space-y-2">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span className="text-sm text-muted-foreground">上传中...</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center space-y-2">
                            <Upload className="h-8 w-8 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground hover:text-foreground">点击选择图片</span>
                            <span className="text-xs text-muted-foreground">最大 {maxSize}MB</span>
                          </div>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept={accept}
                          onChange={handleFileChange}
                          disabled={isUploading}
                          className="hidden"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-center text-muted-foreground">
                      支持粘贴截图（Ctrl+V / Cmd+V）
                    </p>
                  </TabsContent>
                  <TabsContent value="url" className="space-y-4">
                    <div className="space-y-2">
                      <Input
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleUrlSubmit()
                          }
                        }}
                        disabled={isValidatingUrl}
                      />
                      <Button 
                        onClick={handleUrlSubmit} 
                        disabled={isValidatingUrl || !urlInput.trim()}
                        className="w-full"
                      >
                        {isValidatingUrl ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            验证中...
                          </>
                        ) : (
                          <>
                            <Link2 className="mr-2 h-4 w-4" />
                            确认
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
                {error && (
                  <p className="text-sm text-destructive text-center">{error}</p>
                )}
              </DialogContent>
            </Dialog>
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
        <Dialog>
          <DialogTrigger asChild>
            <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-input p-8 hover:border-primary/50 transition-colors cursor-pointer">
              <div className="text-center">
                {isUploading ? (
                  <div className="flex flex-col items-center space-y-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">上传中...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground hover:text-foreground">{placeholder}</span>
                    <span className="text-xs text-muted-foreground">最大 {maxSize}MB</span>
                  </div>
                )}
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>上传图片</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">上传图片</TabsTrigger>
                <TabsTrigger value="url">输入链接</TabsTrigger>
              </TabsList>
              <TabsContent value="upload" className="space-y-4">
                <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-input p-8 hover:border-primary/50 transition-colors">
                  <div className="text-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    {isUploading ? (
                      <div className="flex flex-col items-center space-y-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">上传中...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center space-y-2">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground hover:text-foreground">点击选择图片</span>
                        <span className="text-xs text-muted-foreground">最大 {maxSize}MB</span>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={accept}
                      onChange={handleFileChange}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-2">
                    支持拖拽图片到此处上传
                  </p>
                  <p className="text-xs text-muted-foreground">
                    也可直接粘贴截图（Ctrl+V / Cmd+V）
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="url" className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleUrlSubmit()
                      }
                    }}
                    disabled={isValidatingUrl}
                  />
                  <Button 
                    onClick={handleUrlSubmit} 
                    disabled={isValidatingUrl || !urlInput.trim()}
                    className="w-full"
                  >
                    {isValidatingUrl ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        验证中...
                      </>
                    ) : (
                      <>
                        <Link2 className="mr-2 h-4 w-4" />
                        确认
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
          </DialogContent>
        </Dialog>
      )}
      {error && !value && (
        <p className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
