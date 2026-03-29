import * as React from "react"
import { cn } from "@/lib/utils"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  minHeight?: number
}

function RichTextEditor({
  value,
  onChange,
  placeholder = "输入内容...",
  className,
  minHeight = 200,
}: RichTextEditorProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`min-h-[${minHeight}px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
      />
      <p className="text-xs text-muted-foreground">
        支持 Markdown 格式
      </p>
    </div>
  )
}

export default RichTextEditor
