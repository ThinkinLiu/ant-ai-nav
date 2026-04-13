'use client'

import { useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Heading from '@tiptap/extension-heading'
import Blockquote from '@tiptap/extension-blockquote'
import CodeBlock from '@tiptap/extension-code-block'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Code,
  Link as LinkIcon,
  List, 
  ListOrdered,
  ListChecks,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Minus,
  Undo,
  Redo,
  Image as ImageIcon,
  Code2
} from 'lucide-react'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  disabled?: boolean
  placeholder?: string
  minHeight?: string
  onImageUpload?: (file: File) => Promise<string>
}

export default function RichTextEditor({
  content,
  onChange,
  disabled = false,
  placeholder = '请输入内容，支持粘贴富文本内容...',
  minHeight = '200px',
  onImageUpload
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'bg-muted rounded p-4 font-mono text-sm my-2',
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: 'border-l-4 border-primary pl-4 italic my-2',
          },
        },
        horizontalRule: {
          HTMLAttributes: {
            class: 'my-4 border-border',
          },
        },
      }),
      Heading.configure({
        levels: [1, 2, 3],
        HTMLAttributes: {
          class: 'font-bold',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-800 underline cursor-pointer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-2',
        },
      }),
      Blockquote,
      CodeBlock,
      HorizontalRule,
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content,
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none p-4',
        style: `min-height: ${minHeight}`,
      },
      handlePaste: (view, event) => {
        // 获取剪贴板数据
        const clipboardData = event.clipboardData
        if (!clipboardData) return false
        
        // 检查是否有 HTML 内容（从网页粘贴）
        const html = clipboardData.getData('text/html')
        const items = clipboardData.items
        
        // 如果有图片
        for (let i = 0; i < items.length; i++) {
          const item = items[i]
          if (item.type.startsWith('image/')) {
            event.preventDefault()
            const file = item.getAsFile()
            if (file) {
              handleImagePaste(file)
              return true
            }
          }
        }
        
        // 如果有 HTML 内容，保留格式粘贴
        if (html) {
          event.preventDefault()
          // 清理 HTML，移除外部样式，只保留结构
          const cleanHtml = cleanPastedHtml(html)
          editor?.commands.insertContent(cleanHtml)
          return true
        }
        
        // 纯文本，让默认处理
        return false
      },
      handleDrop: (view, event, slice, moved) => {
        // 处理拖拽图片
        if (!moved && event.dataTransfer?.files?.length) {
          const files = Array.from(event.dataTransfer.files)
          const imageFile = files.find(f => f.type.startsWith('image/'))
          
          if (imageFile) {
            event.preventDefault()
            handleImagePaste(imageFile)
            return true
          }
        }
        return false
      },
    },
  })

  const handleImagePaste = async (file: File) => {
    if (!editor) return
    
    // 如果有自定义上传函数，使用它
    if (onImageUpload) {
      try {
        const url = await onImageUpload(file)
        editor.chain().focus().setImage({ src: url }).run()
      } catch (error) {
        console.error('图片上传失败:', error)
        // 如果上传失败，尝试作为 base64 插入
        const reader = new FileReader()
        reader.onload = (e) => {
          const base64 = e.target?.result as string
          if (base64) {
            editor.chain().focus().setImage({ src: base64 }).run()
          }
        }
        reader.readAsDataURL(file)
      }
    } else {
      // 直接作为 base64 插入
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64 = e.target?.result as string
        if (base64) {
          editor.chain().focus().setImage({ src: base64 }).run()
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // 清理粘贴的 HTML，移除外部样式但保留基本结构
  const cleanPastedHtml = (html: string): string => {
    // 创建临时 DOM 来处理 HTML
    if (typeof window === 'undefined') return html
    
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    
    // 移除所有 style 属性和外部样式表引用
    const elements = doc.body.querySelectorAll('*')
    elements.forEach(el => {
      el.removeAttribute('style')
      el.removeAttribute('class')
      el.removeAttribute('id')
      el.removeAttribute('data-id')
      el.removeAttribute('data-type')
      el.removeAttribute('data-version')
      el.removeAttribute('data-pault-text-color')
      el.removeAttribute('data-pault-bg-color')
      el.removeAttribute('data-pault-font-size')
      el.removeAttribute('data-pault-letter-spacing')
      el.removeAttribute('data-pault-line-height')
      el.removeAttribute('data-pault-text-align')
      el.removeAttribute('data-pault-width')
      el.removeAttribute('data-pault-slug')
      el.removeAttribute('data-pault-image')
      el.removeAttribute('data-pault-video')
      el.removeAttribute('data-pault-file')
      el.removeAttribute('data-pault-embed')
      el.removeAttribute('data-pault-tweet')
      el.removeAttribute('data-pault-github')
      el.removeAttribute('data-pault-hrtype')
      el.removeAttribute('data-pault-src')
    })
    
    // 移除 script 和 style 标签
    const scripts = doc.body.querySelectorAll('script, style, noscript, iframe, object, embed')
    scripts.forEach(el => el.remove())
    
    // 处理图片 - 保留 src，如果是 base64 或绝对 URL
    const images = doc.body.querySelectorAll('img')
    images.forEach(img => {
      const src = img.getAttribute('src')
      if (src && (src.startsWith('data:') || src.startsWith('http'))) {
        // 保留有效图片
      } else {
        // 移除无效图片
        img.remove()
      }
    })
    
    // 处理链接
    const links = doc.body.querySelectorAll('a')
    links.forEach(link => {
      // 保留 href
      const href = link.getAttribute('href')
      if (!href || href.startsWith('javascript:')) {
        // 移除无用的链接，保留文本
        link.replaceWith(link.textContent || '')
      }
    })
    
    return doc.body.innerHTML
  }

  const addLink = useCallback(() => {
    if (!editor) return
    const url = window.prompt('请输入链接地址:')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }, [editor])

  const unsetLink = useCallback(() => {
    editor?.chain().focus().unsetLink().run()
  }, [editor])

  const addImage = useCallback(() => {
    if (!editor) return
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        handleImagePaste(file)
      }
    }
    input.click()
  }, [editor, handleImagePaste])

  if (!editor) {
    return null
  }

  return (
    <div className="border rounded-md overflow-hidden">
      {/* 工具栏 */}
      <div className="border-b bg-muted/30 p-2 flex flex-wrap gap-1 items-center">
        {/* 文本格式 */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={disabled || !editor.can().chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-muted' : ''}
          title="加粗"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={disabled || !editor.can().chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-muted' : ''}
          title="斜体"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={disabled || !editor.can().chain().focus().toggleStrike().run()}
          className={editor.isActive('strike') ? 'bg-muted' : ''}
          title="删除线"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={disabled || !editor.can().chain().focus().toggleCode().run()}
          className={editor.isActive('code') ? 'bg-muted' : ''}
          title="行内代码"
        >
          <Code className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* 链接 */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={editor.isActive('link') ? unsetLink : addLink}
          disabled={disabled}
          className={editor.isActive('link') ? 'bg-muted' : ''}
          title="添加链接"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* 标题 */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          disabled={disabled}
          className={editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}
          title="标题1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          disabled={disabled}
          className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}
          title="标题2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          disabled={disabled}
          className={editor.isActive('heading', { level: 3 }) ? 'bg-muted' : ''}
          title="标题3"
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* 列表 */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={disabled}
          className={editor.isActive('bulletList') ? 'bg-muted' : ''}
          title="无序列表"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          disabled={disabled}
          className={editor.isActive('orderedList') ? 'bg-muted' : ''}
          title="有序列表"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          disabled={disabled}
          className={editor.isActive('taskList') ? 'bg-muted' : ''}
          title="任务列表"
        >
          <ListChecks className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* 引用和代码块 */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          disabled={disabled}
          className={editor.isActive('blockquote') ? 'bg-muted' : ''}
          title="引用"
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          disabled={disabled}
          className={editor.isActive('codeBlock') ? 'bg-muted' : ''}
          title="代码块"
        >
          <Code2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          disabled={disabled}
          title="分割线"
        >
          <Minus className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* 图片 */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addImage}
          disabled={disabled}
          title="插入图片"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* 撤销和重做 */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={disabled || !editor.can().undo()}
          title="撤销"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={disabled || !editor.can().redo()}
          title="重做"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* 编辑器内容区域 */}
      <div className="relative">
        <EditorContent 
          editor={editor} 
          className={disabled ? 'opacity-50 cursor-not-allowed' : ''}
        />
      </div>
      
      {/* 粘贴提示 */}
      <div className="text-xs text-muted-foreground px-3 pb-2 bg-muted/20">
        支持直接粘贴网页内容（保留格式）、粘贴图片、拖拽图片
      </div>
    </div>
  )
}
