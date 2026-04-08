'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { X, Search, Check } from 'lucide-react'

interface Tool {
  id: number
  name: string
  slug: string
  description: string | null
  logo: string | null
  website: string | null
}

interface ToolSelectorProps {
  selectedTools: number[]
  onChange: (toolIds: number[]) => void
  label?: string
  placeholder?: string
  maxSelect?: number
}

export default function ToolSelector({
  selectedTools,
  onChange,
  label = '关联AI工具',
  placeholder = '搜索工具名称...',
  maxSelect = 10,
}: ToolSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredTools, setFilteredTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedToolDetails, setSelectedToolDetails] = useState<Tool[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  // 获取工具列表
  const fetchTools = async (query = '') => {
    setLoading(true)
    try {
      const url = query
        ? `/api/tools?search=${encodeURIComponent(query)}&limit=50`
        : '/api/tools?limit=50'
      const response = await fetch(url)
      const result = await response.json()

      if (result.success && result.data) {
        // API 返回的数据结构是 { data: { data: [...], total: ... } }
        const toolsData = Array.isArray(result.data.data) ? result.data.data : []
        setFilteredTools(toolsData)
      }
    } catch (error) {
      console.error('获取工具列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 获取已选工具的详细信息
  const fetchSelectedToolDetails = async () => {
    if (selectedTools.length === 0) {
      setSelectedToolDetails([])
      return
    }

    try {
      const response = await fetch(`/api/tools?ids=${selectedTools.join(',')}`)
      const result = await response.json()

      if (result.success && result.data) {
        // API 返回的数据结构是 { data: { data: [...], total: ... } }
        const toolsData = Array.isArray(result.data.data) ? result.data.data : []
        setSelectedToolDetails(toolsData)
      }
    } catch (error) {
      console.error('获取已选工具详情失败:', error)
    }
  }

  // 初始加载
  useEffect(() => {
    fetchTools()
  }, [])

  // 搜索 - 从所有工具中搜索
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim()) {
        // 有搜索词时，从所有工具中搜索
        fetchTools(searchQuery.trim())
      } else {
        // 搜索框为空时，显示默认工具列表
        fetchTools()
      }
    }, 300)

    return () => clearTimeout(delayDebounce)
  }, [searchQuery])

  // 获取已选工具详情
  useEffect(() => {
    fetchSelectedToolDetails()
  }, [selectedTools])

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleToggleTool = (toolId: number) => {
    if (selectedTools.includes(toolId)) {
      // 移除
      onChange(selectedTools.filter((id) => id !== toolId))
    } else {
      // 添加
      if (selectedTools.length >= maxSelect) {
        return // 已达到最大选择数
      }
      onChange([...selectedTools, toolId])
    }
  }

  const handleRemoveTool = (toolId: number) => {
    onChange(selectedTools.filter((id) => id !== toolId))
  }

  return (
    <div className="space-y-3" ref={containerRef}>
      <Label>{label}</Label>

      {/* 已选工具 */}
      {selectedToolDetails.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg border">
          {selectedToolDetails.map((tool) => (
            <div
              key={tool.id}
              className="flex items-center gap-2 px-3 py-1.5 bg-background border rounded-lg hover:border-primary transition-colors"
            >
              {tool.logo && (
                <img
                  src={tool.logo}
                  alt={tool.name}
                  className="w-5 h-5 rounded object-contain"
                />
              )}
              <span className="text-sm">{tool.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto p-0.5 w-auto hover:bg-destructive/10 hover:text-destructive"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleRemoveTool(tool.id)
                }}
                title="删除"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
          <span className="text-xs text-muted-foreground ml-1">
            {selectedTools.length}/{maxSelect}
          </span>
        </div>
      )}

      {/* 搜索框 */}
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="pr-10"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-8 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>

      {/* 工具列表下拉框 */}
      {isOpen && (
        <div className="relative z-50">
          <div className="absolute top-0 left-0 right-0 bg-popover border rounded-lg shadow-lg max-h-80 overflow-hidden">
            <ScrollArea className="h-80">
              <div className="p-2">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : filteredTools.length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    {searchQuery ? '未找到匹配的工具' : '暂无工具数据'}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredTools.map((tool) => {
                      const isSelected = selectedTools.includes(tool.id)
                      return (
                        <div
                          key={tool.id}
                          className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                            isSelected ? 'bg-muted' : ''
                          }`}
                          onClick={() => handleToggleTool(tool.id)}
                        >
                          <Checkbox
                            checked={isSelected}
                            onChange={() => handleToggleTool(tool.id)}
                            disabled={!isSelected && selectedTools.length >= maxSelect}
                          />
                          {tool.logo && (
                            <img
                              src={tool.logo}
                              alt={tool.name}
                              className="w-8 h-8 rounded-lg object-contain flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium truncate">{tool.name}</span>
                              {isSelected && (
                                <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                              )}
                            </div>
                            {tool.description && (
                              <p className="text-xs text-muted-foreground truncate">
                                {tool.description}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {selectedTools.length === 0 ? '请选择相关AI工具' : `已选择 ${selectedTools.length} 个工具，最多可选 ${maxSelect} 个`}
      </p>
    </div>
  )
}
