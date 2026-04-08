'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Plus, Trash2, GripVertical, Loader2, Save } from 'lucide-react'

interface MenuItem {
  id?: number
  label: string
  url: string
  icon: string
  sort_order: number
  is_active: boolean
  is_default: boolean
}

interface MenuConfigProps {
  menuType: 'site' | 'blog'
  title: string
  description: string
}

export function MenuConfig({ menuType, title, description }: MenuConfigProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // 加载菜单配置
  useEffect(() => {
    fetchMenuItems()
  }, [menuType])

  const fetchMenuItems = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/menu-items?menuType=${menuType}`)
      const data = await response.json()
      setMenuItems(data.data || [])
    } catch (error) {
      console.error('获取菜单配置失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/menu-items', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menuType, items: menuItems })
      })

      if (response.ok) {
        setSaveMessage({ type: 'success', text: '保存成功' })
        setTimeout(() => setSaveMessage(null), 3000)
        await fetchMenuItems()
      } else {
        setSaveMessage({ type: 'error', text: '保存失败' })
        setTimeout(() => setSaveMessage(null), 3000)
      }
    } catch (error) {
      setSaveMessage({ type: 'error', text: '保存失败' })
      setTimeout(() => setSaveMessage(null), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddItem = () => {
    const newOrder = menuItems.length > 0 ? Math.max(...menuItems.map(item => item.sort_order)) + 1 : 1
    setMenuItems([
      ...menuItems,
      {
        label: '新菜单',
        url: '/',
        icon: '',
        sort_order: newOrder,
        is_active: true,
        is_default: false
      }
    ])
  }

  const handleDeleteItem = (index: number) => {
    const newItems = [...menuItems]
    newItems.splice(index, 1)
    setMenuItems(newItems)
  }

  const handleUpdateItem = (index: number, field: keyof MenuItem, value: any) => {
    const newItems = [...menuItems]
    newItems[index] = { ...newItems[index], [field]: value }
    setMenuItems(newItems)
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const newItems = [...menuItems]
    const temp = newItems[index].sort_order
    newItems[index].sort_order = newItems[index - 1].sort_order
    newItems[index - 1].sort_order = temp
    ;[newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]]
    setMenuItems(newItems)
  }

  const handleMoveDown = (index: number) => {
    if (index === menuItems.length - 1) return
    const newItems = [...menuItems]
    const temp = newItems[index].sort_order
    newItems[index].sort_order = newItems[index + 1].sort_order
    newItems[index + 1].sort_order = temp
    ;[newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]]
    setMenuItems(newItems)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {saveMessage && (
              <span className={`text-sm ${saveMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {saveMessage.text}
              </span>
            )}
            <Button onClick={handleAddItem} size="sm" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              添加菜单
            </Button>
            <Button onClick={handleSave} disabled={isSaving} size="sm">
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              保存
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {menuItems.map((item, index) => (
            <div key={item.id || index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                  <span className="text-sm text-muted-foreground">排序: {item.sort_order}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleMoveUp(index)}
                    size="sm"
                    variant="ghost"
                    disabled={index === 0}
                  >
                    ↑
                  </Button>
                  <Button
                    onClick={() => handleMoveDown(index)}
                    size="sm"
                    variant="ghost"
                    disabled={index === menuItems.length - 1}
                  >
                    ↓
                  </Button>
                  {!item.is_default && (
                    <Button
                      onClick={() => handleDeleteItem(index)}
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  {item.is_default && (
                    <span className="text-xs text-muted-foreground">默认菜单</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`label-${index}`}>菜单名称</Label>
                  <Input
                    id={`label-${index}`}
                    value={item.label}
                    onChange={(e) => handleUpdateItem(index, 'label', e.target.value)}
                    placeholder="菜单名称"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`url-${index}`}>链接地址</Label>
                  <Input
                    id={`url-${index}`}
                    value={item.url}
                    onChange={(e) => handleUpdateItem(index, 'url', e.target.value)}
                    placeholder="/path"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`icon-${index}`}>图标 (可选)</Label>
                  <select
                    id={`icon-${index}`}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={item.icon}
                    onChange={(e) => handleUpdateItem(index, 'icon', e.target.value)}
                  >
                    <option value="">无图标</option>
                    <option value="home">首页图标</option>
                    <option value="book">书签图标</option>
                    <option value="compass">指南针图标</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={item.is_active}
                  onCheckedChange={(checked) => handleUpdateItem(index, 'is_active', checked)}
                />
                <Label className="text-sm">显示此菜单</Label>
              </div>
            </div>
          ))}

          {menuItems.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              暂无菜单项，点击"添加菜单"按钮添加
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
