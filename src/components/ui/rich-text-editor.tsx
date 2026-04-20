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
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
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
      Table.configure({
        resizable: false,
        HTMLAttributes: {
          class: 'border-collapse w-full my-4',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border bg-muted/50 px-3 py-2 font-semibold text-left',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border px-3 py-2',
        },
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
        style: `height: ${minHeight}; overflow-y: auto;`,
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

  // 清理粘贴的 HTML，保留格式但移除外部样式
  const cleanPastedHtml = (html: string): string => {
    // 创建临时 DOM 来处理 HTML
    if (typeof window === 'undefined') return html
    
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    
    // ===== 第一步：处理已有的 <pre> 标签（如果有的话） =====
    const preElements = doc.body.querySelectorAll('pre')
    preElements.forEach(pre => {
      // 获取纯文本内容，保留换行
      let rawText = ''
      const processNode = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          rawText += node.textContent || ''
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as Element
          const tagName = el.tagName?.toLowerCase()
          
          if (tagName === 'br') {
            rawText += '\n'
          } else if (['div', 'p', 'li', 'tr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName || '')) {
            if (rawText.length > 0 && !rawText.endsWith('\n')) {
              rawText += '\n'
            }
            el.childNodes.forEach(child => processNode(child))
            if (!rawText.endsWith('\n')) {
              rawText += '\n'
            }
          } else {
            el.childNodes.forEach(child => processNode(child))
          }
        }
      }
      
      pre.childNodes.forEach(child => processNode(child))
      
      // 清除所有子元素并重建
      while (pre.firstChild) {
        pre.removeChild(pre.firstChild)
      }
      
      const code = doc.createElement('code')
      code.textContent = rawText
      pre.appendChild(code)
      
      // 清理属性
      pre.removeAttribute('class')
      pre.removeAttribute('style')
      pre.removeAttribute('data-language')
      pre.removeAttribute('data-highlighted')
      pre.setAttribute('class', 'bg-muted rounded p-4 font-mono text-sm my-2 overflow-x-auto')
      
      code.removeAttribute('class')
      code.removeAttribute('style')
    })
    
    // ===== 第二步：处理 Markdown 代码块（```xxx ... ```）=====
    // 遍历所有文本节点，查找 Markdown 代码块并合并
    const processMarkdownCodeBlocks = () => {
      const walker = document.createTreeWalker(
        doc.body,
        NodeFilter.SHOW_TEXT,
        null
      )
      
      const nodesToProcess: Text[] = []
      let n: Text | null
      while ((n = walker.nextNode() as Text)) {
        nodesToProcess.push(n)
      }
      
      // 查找包含 ``` 的文本节点
      for (let i = 0; i < nodesToProcess.length; i++) {
        const textNode = nodesToProcess[i]
        const text = textNode.textContent || ''
        
        if (!text.includes('```')) continue
        
        // 检查是否在 code 标签内（已处理过）
        if (textNode.parentElement?.tagName.toLowerCase() === 'code') continue
        
        // 检查是否在 pre 标签内（已处理过）
        if (textNode.parentElement?.tagName.toLowerCase() === 'pre') continue
        
        // 检查是否在 block 元素内（p, div 等）
        const parent = textNode.parentElement
        const inBlock = ['p', 'div', 'span'].includes(parent?.tagName?.toLowerCase() || '')
        
        if (!inBlock) continue
        
        // 收集所有相关节点
        const blockNodes: Node[] = []
        let j = i
        
        // 向前查找（通常不需要，但安全起见）
        while (j > 0 && j < nodesToProcess.length) {
          const prevNode = nodesToProcess[j - 1]
          if (prevNode.parentElement === parent) {
            blockNodes.unshift(prevNode)
            j--
          } else {
            break
          }
        }
        
        // 从当前位置开始收集
        let foundEnd = false
        let foundContent = false
        while (j < nodesToProcess.length) {
          const node = nodesToProcess[j]
          if (node.parentElement !== parent) break
          
          blockNodes.push(node)
          const nodeText = node.textContent || ''
          
          // 检查是否找到开始标记
          if (nodeText.trim().startsWith('```') || nodeText.includes('```')) {
            foundContent = true
          }
          
          // 检查是否找到结束标记
          if (foundContent && nodeText.includes('```') && nodeText.indexOf('```') !== nodeText.lastIndexOf('```')) {
            foundEnd = true
            break
          }
          
          // 如果是代码块内容，继续收集
          if (foundContent && !foundEnd) {
            // 检查是否到达新的块级元素
            if (nodeText.trim() && 
                !nodeText.includes('```') && 
                !nodeText.includes('\n') && 
                parent?.nextElementSibling) {
              // 可能到达新段落
              break
            }
          }
          
          j++
          if (j - i > 100) break // 安全限制
        }
        
        // 合并文本
        const fullText = blockNodes.map(n => n.textContent || '').join('')
        
        // 提取代码块内容
        const match = fullText.match(/```(\w*)?\s*\n?([\s\S]*?)```/)
        if (match && match[2]) {
          const code = match[2]
          const lang = match[1] || ''
          
          // 创建 pre 元素
          const pre = doc.createElement('pre')
          pre.setAttribute('class', 'bg-muted rounded p-4 font-mono text-sm my-2 overflow-x-auto')
          const codeEl = doc.createElement('code')
          if (lang) {
            codeEl.setAttribute('class', `language-${lang}`)
          }
          codeEl.textContent = code
          pre.appendChild(codeEl)
          
          // 替换第一个节点
          if (blockNodes[0].parentNode) {
            blockNodes[0].parentNode.replaceChild(pre, blockNodes[0])
            
            // 删除其他节点
            for (let k = 1; k < blockNodes.length; k++) {
              if (blockNodes[k].parentNode) {
                blockNodes[k].parentNode.removeChild(blockNodes[k])
              }
            }
          }
          
          // 跳过已处理的节点
          i = j
        }
      }
    }
    
    processMarkdownCodeBlocks()
    
    // ===== 第三步：处理带代码特征的 div/p 标签 =====
    const codeBlockSelectors = [
      '[class*="code-block"]',
      '[class*="codeblock"]',
      '[class*="code_block"]',
      '[class*="highlight"]',
      '[class*="syntax-highlight"]',
      '[data-language]',
      '[class*="ql-code-block"]',
      '[class*="prism"]',
      '[class*="shiki"]',
      // 带等宽字体且是 block 级别的
      'div[class*="language-"]',
      'p[class*="language-"]',
    ]
    
    codeBlockSelectors.forEach(selector => {
      try {
        const blocks = doc.body.querySelectorAll(selector)
        blocks.forEach(block => {
          // 如果父元素不是 pre 且当前元素不是 pre
          if (block.parentElement?.tagName.toLowerCase() !== 'pre' && 
              block.tagName.toLowerCase() !== 'pre') {
            
            const text = block.textContent || ''
            // 检查是否看起来像代码（包含缩进、符号等）
            const hasCodeFeatures = 
              text.includes('{') || text.includes('}') ||
              text.includes('function') || text.includes('const ') ||
              text.includes('import ') || text.includes('export ') ||
              text.includes('class ') || text.includes('def ') ||
              text.includes('return ') || text.includes('=>') ||
              text.includes('```') || text.includes('//') ||
              text.includes('#include') || text.includes('print(') ||
              /^\s{2,}/m.test(text) // 有2个以上空格的行
            
            if (hasCodeFeatures && text.length > 10) {
              // 转换为 pre
              const pre = doc.createElement('pre')
              pre.setAttribute('class', 'bg-muted rounded p-4 font-mono text-sm my-2 overflow-x-auto')
              const code = doc.createElement('code')
              code.textContent = text.trim()
              pre.appendChild(code)
              block.parentNode?.replaceChild(pre, block)
            }
          }
        })
      } catch (e) {
        // 忽略无效的选择器
      }
    })
    
    // ===== 第二步：移除所有 style 和不必要的属性 =====
    const allElements = doc.body.querySelectorAll('*')
    allElements.forEach(el => {
      el.removeAttribute('style')
      el.removeAttribute('id')
      el.removeAttribute('data-id')
      el.removeAttribute('data-type')
      el.removeAttribute('data-version')
      el.removeAttribute('data-language')
      el.removeAttribute('data-highlighted')
      el.removeAttribute('data-lang')
      el.removeAttribute('tabindex')
      el.removeAttribute('spellcheck')
      
      // 移除所有 data-* 属性
      Array.from(el.attributes).forEach(attr => {
        if (attr.name.startsWith('data-')) {
          el.removeAttribute(attr.name)
        }
      })
    })
    
    // ===== 第三步：移除 script 和 style 标签 =====
    const scripts = doc.body.querySelectorAll('script, style, noscript, iframe, object, embed, svg')
    scripts.forEach(el => el.remove())
    
    // ===== 第四步：处理代码块内的 span 等嵌套元素 =====
    const nestedInPre = doc.body.querySelectorAll('pre *, code *')
    nestedInPre.forEach(el => {
      const text = el.textContent || ''
      el.replaceWith(doc.createTextNode(text))
    })
    
    // 处理图片
    const images = doc.body.querySelectorAll('img')
    images.forEach(img => {
      const src = img.getAttribute('src')
      // 处理相对路径 - 尝试转为绝对路径（如果可能）
      if (src && !src.startsWith('data:') && !src.startsWith('http') && !src.startsWith('//')) {
        img.remove()
      } else if (src && (src.startsWith('data:') || src.startsWith('http') || src.startsWith('//'))) {
        // 保留有效图片，添加样式
        img.setAttribute('class', 'max-w-full h-auto rounded-lg my-4')
        img.removeAttribute('style')
        img.removeAttribute('width')
        img.removeAttribute('height')
        img.removeAttribute('loading')
      } else {
        img.remove()
      }
    })
    
    // 处理表格 - 转换为简单的 HTML 表格
    const tables = doc.body.querySelectorAll('table')
    tables.forEach(table => {
      // 清理表格单元格
      const cells = table.querySelectorAll('td, th')
      cells.forEach(cell => {
        cell.removeAttribute('style')
        cell.removeAttribute('class')
        // 保留基本的单元格内容
        const content = cell.innerHTML
        cell.innerHTML = content
      })
      
      // 清理表格行
      const rows = table.querySelectorAll('tr')
      rows.forEach(row => {
        row.removeAttribute('style')
        row.removeAttribute('class')
      })
      
      // 清理表格
      table.removeAttribute('style')
      table.removeAttribute('class')
      table.setAttribute('class', 'border-collapse w-full my-4')
      
      // 清理 thead 和 tbody
      const thead = table.querySelector('thead')
      if (thead) {
        thead.removeAttribute('style')
        thead.removeAttribute('class')
      }
      const tbody = table.querySelector('tbody')
      if (tbody) {
        tbody.removeAttribute('style')
        tbody.removeAttribute('class')
      }
    })
    
    // 处理链接
    const links = doc.body.querySelectorAll('a')
    links.forEach(link => {
      // 保留 href
      const href = link.getAttribute('href')
      if (!href || href.startsWith('javascript:') || href === '#') {
        // 移除无用的链接，保留文本
        link.replaceWith(link.textContent || '')
      } else {
        // 保留链接但移除样式
        link.removeAttribute('style')
        link.removeAttribute('class')
      }
    })
    
    // 移除空的段落和 div
    const emptyElements = doc.body.querySelectorAll('p:empty, div:empty, span:empty, br')
    emptyElements.forEach(el => {
      if (el.tagName === 'BR') return // 保留 br
      el.remove()
    })
    
    // ===== 最终处理：保护代码块，清理其他地方的格式 =====
    // 先提取所有 pre 标签内容
    const preContents: string[] = []
    const allPreElements = doc.body.querySelectorAll('pre')
    allPreElements.forEach((pre, index) => {
      preContents[index] = pre.outerHTML
      pre.setAttribute('data-code-block-index', index.toString())
    })
    
    // 清理连续的空行（代码块外）
    let cleanHtml = doc.body.innerHTML
    cleanHtml = cleanHtml.replace(/<p><br\s*\/?><\/p>/gi, '<br>')
    cleanHtml = cleanHtml.replace(/<div><br\s*\/?><\/div>/gi, '<br>')
    cleanHtml = cleanHtml.replace(/<br\s*\/?>\s*<br\s*\/?>/gi, '<br>')
    
    // 标准化列表结构
    cleanHtml = cleanHtml.replace(/<li>\s*<p>([\s\S]*?)<\/p>\s*<\/li>/gi, '<li>$1</li>')
    cleanHtml = cleanHtml.replace(/<p>\s*<li>([\s\S]*?)<\/li>\s*<\/p>/gi, '<li>$1</li>')
    
    // 清理多余的空格（但要保护代码块内的格式）
    // 替换临时代理符
    cleanHtml = cleanHtml.replace(/<pre([^>]*)>/gi, '___PRE_START___$1___')
    cleanHtml = cleanHtml.replace(/<\/pre>/gi, '___PRE_END___')
    cleanHtml = cleanHtml.replace(/\s+/g, ' ')
    cleanHtml = cleanHtml.replace(/___PRE_START___/g, '<pre')
    cleanHtml = cleanHtml.replace(/___PRE_END___/g, '</pre>')
    
    // 恢复代码块原始内容
    allPreElements.forEach((pre, index) => {
      if (preContents[index]) {
        cleanHtml = cleanHtml.replace(
          `<pre data-code-block-index="${index}">${pre.querySelector('code')?.textContent || ''}</pre>`,
          preContents[index]
        )
      }
    })
    
    // 清理 pre 标签上的临时代理属性
    cleanHtml = cleanHtml.replace(/\s*data-code-block-index="\d+"/g, '')
    
    return cleanHtml
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
