'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { 
  Download, Upload, Database, AlertTriangle, CheckCircle, Loader2,
  ChevronDown, ChevronUp, FileJson, FileCode, FileSpreadsheet
} from 'lucide-react'

// 表定义类型
interface TableDefinition {
  name: string
  category: string
  label: string
  description: string
  count: number
}

// 分类定义类型
interface CategoryDefinition {
  id: string
  label: string
  description: string
}

export default function DataMigrationPage() {
  const { user } = useAuth()
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importProgress, setImportProgress] = useState<string>('')
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 导出表结构相关状态
  const [exportingSchema, setExportingSchema] = useState(false)
  const [schemaFormat, setSchemaFormat] = useState<'json' | 'sql'>('sql')

  // 导出相关状态
  const [tables, setTables] = useState<TableDefinition[]>([])
  const [categories, setCategories] = useState<CategoryDefinition[]>([])
  const [exportMode, setExportMode] = useState<'full' | 'business' | 'content' | 'settings' | 'custom'>('business')
  const [selectedTables, setSelectedTables] = useState<Set<string>>(new Set())
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['content', 'system']))
  const [loadingTables, setLoadingTables] = useState(true)

  // 加载表定义
  useEffect(() => {
    if (user?.role === 'admin') {
      fetchTableDefinitions()
    }
  }, [user])

  const fetchTableDefinitions = async () => {
    setLoadingTables(true)
    try {
      const response = await fetch('/api/admin/data/export?action=tables')
      const result = await response.json()
      if (result.success) {
        setTables(result.data)
        setCategories(result.categories)
      }
    } catch (error) {
      console.error('获取表定义失败:', error)
    } finally {
      setLoadingTables(false)
    }
  }

  // 根据导出模式更新选中的表
  useEffect(() => {
    if (exportMode !== 'custom') {
      const modeTables: Record<string, string[]> = {
        full: tables.map(t => t.name),
        business: tables.filter(t => t.category !== 'user').map(t => t.name),
        content: ['ai_tools', 'ai_news', 'ai_hall_of_fame', 'ai_timeline', 'categories', 'tags', 'tool_tags'],
        settings: ['site_settings', 'smtp_settings', 'seo_settings', 'friend_links'],
      }
      setSelectedTables(new Set(modeTables[exportMode] || []))
    }
  }, [exportMode, tables])

  // 检查权限
  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">需要管理员权限访问此页面</p>
      </div>
    )
  }

  // 切换表选中状态
  const toggleTable = (tableName: string) => {
    const newSelected = new Set(selectedTables)
    if (newSelected.has(tableName)) {
      newSelected.delete(tableName)
    } else {
      newSelected.add(tableName)
    }
    setSelectedTables(newSelected)
    setExportMode('custom')
  }

  // 切换分类全选
  const toggleCategory = (categoryId: string) => {
    const categoryTables = tables.filter(t => t.category === categoryId).map(t => t.name)
    const allSelected = categoryTables.every(t => selectedTables.has(t))
    
    const newSelected = new Set(selectedTables)
    if (allSelected) {
      categoryTables.forEach(t => newSelected.delete(t))
    } else {
      categoryTables.forEach(t => newSelected.add(t))
    }
    setSelectedTables(newSelected)
    setExportMode('custom')
  }

  // 切换分类展开
  const toggleExpand = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  // 导出数据
  const handleExport = async () => {
    if (selectedTables.size === 0) {
      toast.error('请至少选择一个数据表')
      return
    }

    setExporting(true)
    try {
      const response = await fetch('/api/admin/data/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
        },
        body: JSON.stringify({
          mode: exportMode,
          tables: Array.from(selectedTables),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '导出失败')
      }

      // 获取文件名
      const disposition = response.headers.get('Content-Disposition')
      const filenameMatch = disposition?.match(/filename="?(.+)"?/i)
      const filename = filenameMatch ? decodeURIComponent(filenameMatch[1]) : `backup-${Date.now()}.json`

      // 下载文件
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      window.URL.revokeObjectURL(url)

      toast.success(`成功导出 ${selectedTables.size} 个数据表`)
    } catch (error: any) {
      console.error('导出失败:', error)
      toast.error('导出失败：' + error.message)
    } finally {
      setExporting(false)
    }
  }

  // 导入数据
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 验证文件类型
    if (!file.name.endsWith('.json')) {
      toast.error('请选择JSON格式的备份文件')
      return
    }

    setImporting(true)
    setImportProgress('正在读取文件...')

    try {
      const text = await file.text()
      const jsonData = JSON.parse(text)

      // 验证数据格式
      if (!jsonData.data || !jsonData._meta) {
        throw new Error('无效的备份文件格式')
      }

      setImportProgress(`发现 ${jsonData._meta.totalRecords || 0} 条数据，开始导入...`)

      const response = await fetch('/api/admin/data/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
        },
        body: JSON.stringify({
          data: jsonData.data,
          mode: importMode,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(result.message)
        setImportProgress(`导入完成：成功 ${result.summary.totalImported} 条`)
        // 刷新表数据量
        fetchTableDefinitions()
      } else {
        throw new Error(result.error || '导入失败')
      }
    } catch (error: any) {
      console.error('导入失败:', error)
      toast.error('导入失败：' + error.message)
      setImportProgress('')
    } finally {
      setImporting(false)
      // 重置文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // 触发文件选择
  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  // 获取选中表的总数据量
  const getSelectedCount = () => {
    return tables
      .filter(t => selectedTables.has(t.name))
      .reduce((sum, t) => sum + t.count, 0)
  }

  // 导出表结构
  const handleExportSchema = async () => {
    setExportingSchema(true)
    try {
      const action = schemaFormat === 'sql' ? 'schema-sql' : 'schema'
      const tablesParam = selectedTables.size > 0 ? `&tables=${Array.from(selectedTables).join(',')}` : ''
      
      const response = await fetch(`/api/admin/data/export?action=${action}${tablesParam}`, {
        headers: {
          'Authorization': `Bearer ${user?.id}`,
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '导出失败')
      }

      if (schemaFormat === 'json') {
        // JSON 格式
        const data = await response.json()
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        const dateStr = new Date().toISOString().split('T')[0]
        a.download = `ai-nav-schema-${dateStr}.json`
        a.click()
        window.URL.revokeObjectURL(url)
      } else {
        // SQL 格式
        const disposition = response.headers.get('Content-Disposition')
        const filenameMatch = disposition?.match(/filename="?(.+)"?/i)
        const filename = filenameMatch ? decodeURIComponent(filenameMatch[1]) : `schema-${Date.now()}.sql`

        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()
        window.URL.revokeObjectURL(url)
      }

      toast.success('表结构导出成功')
    } catch (error: any) {
      console.error('导出表结构失败:', error)
      toast.error('导出失败：' + error.message)
    } finally {
      setExportingSchema(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">数据迁移</h1>
        <p className="text-muted-foreground mt-1">导出或导入网站数据，用于数据备份和迁移</p>
      </div>

      {/* 导出功能 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-green-600" />
            导出数据
          </CardTitle>
          <CardDescription>
            选择需要导出的数据，支持多种导出模式
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 导出模式选择 */}
          <div className="space-y-3">
            <label className="text-sm font-medium">导出模式</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {[
                { key: 'full', label: '全部导出', desc: '包含用户数据', color: 'bg-red-100 text-red-700 border-red-300' },
                { key: 'business', label: '业务数据', desc: '不含用户信息', color: 'bg-blue-100 text-blue-700 border-blue-300' },
                { key: 'content', label: '内容数据', desc: '核心内容', color: 'bg-green-100 text-green-700 border-green-300' },
                { key: 'settings', label: '设置数据', desc: '系统配置', color: 'bg-purple-100 text-purple-700 border-purple-300' },
                { key: 'custom', label: '自定义', desc: '手动选择', color: 'bg-gray-100 text-gray-700 border-gray-300' },
              ].map((mode) => (
                <button
                  key={mode.key}
                  onClick={() => setExportMode(mode.key as typeof exportMode)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    exportMode === mode.key 
                      ? `${mode.color} border-current ring-2 ring-offset-1` 
                      : 'bg-background hover:bg-muted'
                  }`}
                >
                  <div className="font-medium">{mode.label}</div>
                  <div className="text-xs opacity-70">{mode.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 表选择 */}
          {loadingTables ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">加载数据表...</span>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">数据表选择</label>
                <Badge variant="outline">
                  已选择 {selectedTables.size} 个表，共 {getSelectedCount().toLocaleString()} 条数据
                </Badge>
              </div>

              <div className="border rounded-lg divide-y max-h-96 overflow-auto">
                {categories.map((category) => {
                  const categoryTables = tables.filter(t => t.category === category.id)
                  const allSelected = categoryTables.every(t => selectedTables.has(t.name))
                  const someSelected = categoryTables.some(t => selectedTables.has(t.name))
                  const isExpanded = expandedCategories.has(category.id)
                  const totalCount = categoryTables.reduce((sum, t) => sum + t.count, 0)

                  return (
                    <div key={category.id}>
                      {/* 分类头部 */}
                      <div 
                        className="flex items-center gap-3 p-3 bg-muted/50 cursor-pointer hover:bg-muted"
                        onClick={() => toggleExpand(category.id)}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleCategory(category.id)
                          }}
                          className="flex-shrink-0"
                        >
                          <Checkbox 
                            checked={allSelected} 
                            ref={(el) => {
                              if (el) {
                                (el as any).dataset.state = someSelected && !allSelected ? 'indeterminate' : allSelected ? 'checked' : 'unchecked'
                              }
                            }}
                          />
                        </button>
                        <div className="flex-1">
                          <div className="font-medium">{category.label}</div>
                          <div className="text-xs text-muted-foreground">{category.description}</div>
                        </div>
                        <Badge variant="secondary">{totalCount.toLocaleString()} 条</Badge>
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>

                      {/* 表列表 */}
                      {isExpanded && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 p-2 bg-background">
                          {categoryTables.map((table) => (
                            <label
                              key={table.name}
                              className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                                selectedTables.has(table.name) ? 'bg-primary/10' : 'hover:bg-muted'
                              }`}
                            >
                              <Checkbox
                                checked={selectedTables.has(table.name)}
                                onCheckedChange={() => toggleTable(table.name)}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">{table.label}</div>
                                <div className="text-xs text-muted-foreground truncate">{table.description}</div>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {table.count.toLocaleString()}
                              </Badge>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 导出按钮 */}
          <div className="flex items-center gap-4">
            <Button onClick={handleExport} disabled={exporting || selectedTables.size === 0}>
              {exporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  导出中...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  导出数据
                </>
              )}
            </Button>
            <span className="text-sm text-muted-foreground">
              文件将自动下载到本地
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 导出表结构 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCode className="h-5 w-5 text-orange-600" />
            导出表结构
          </CardTitle>
          <CardDescription>
            导出数据库表结构定义，用于数据库初始化和文档
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 格式选择 */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">导出格式：</span>
            <div className="flex gap-2">
              <Button
                variant={schemaFormat === 'sql' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSchemaFormat('sql')}
              >
                <FileCode className="mr-1 h-4 w-4" />
                SQL 脚本
              </Button>
              <Button
                variant={schemaFormat === 'json' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSchemaFormat('json')}
              >
                <FileSpreadsheet className="mr-1 h-4 w-4" />
                JSON 格式
              </Button>
            </div>
          </div>

          {/* 说明 */}
          <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg text-orange-700 text-sm">
            <Database className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <strong>说明：</strong>
              {schemaFormat === 'sql' 
                ? 'SQL 脚本可直接在 PostgreSQL 数据库中执行，用于创建完整的表结构、索引和触发器。'
                : 'JSON 格式包含详细的字段定义、类型、约束等信息，适合用于文档或程序处理。'}
            </div>
          </div>

          {/* 当前选择的表 */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>将导出：</span>
            <Badge variant="secondary">
              {selectedTables.size > 0 ? `${selectedTables.size} 个选中表` : '全部表'}
            </Badge>
          </div>

          {/* 导出按钮 */}
          <div className="flex items-center gap-4">
            <Button onClick={handleExportSchema} disabled={exportingSchema}>
              {exportingSchema ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  导出中...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  导出表结构
                </>
              )}
            </Button>
            <span className="text-sm text-muted-foreground">
              {schemaFormat === 'sql' ? '.sql 文件' : '.json 文件'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 导入功能 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-600" />
            导入数据
          </CardTitle>
          <CardDescription>
            从备份文件恢复数据
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 导入模式选择 */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">导入模式：</span>
            <div className="flex gap-2">
              <Button
                variant={importMode === 'merge' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setImportMode('merge')}
              >
                <CheckCircle className="mr-1 h-4 w-4" />
                合并模式
              </Button>
              <Button
                variant={importMode === 'replace' ? 'destructive' : 'outline'}
                size="sm"
                onClick={() => setImportMode('replace')}
              >
                <AlertTriangle className="mr-1 h-4 w-4" />
                替换模式
              </Button>
            </div>
          </div>

          {/* 替换模式警告 */}
          {importMode === 'replace' && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <strong>警告：</strong>替换模式会清空现有数据后再导入，此操作不可恢复。请确保已备份当前数据！
              </div>
            </div>
          )}

          {/* 导入按钮 */}
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            <Button onClick={triggerFileSelect} disabled={importing}>
              {importing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  导入中...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  选择备份文件
                </>
              )}
            </Button>
            <span className="text-sm text-muted-foreground">
              选择导出的JSON备份文件
            </span>
          </div>

          {/* 导入进度 */}
          {importProgress && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileJson className="h-4 w-4" />
              {importProgress}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 使用说明 */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center gap-2 text-base">
            <Database className="h-5 w-5" />
            使用说明
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700 text-sm space-y-2">
          <p><strong>全部导出：</strong>导出所有数据，包含用户账号等敏感信息（谨慎使用）</p>
          <p><strong>业务数据：</strong>导出除用户信息外的所有业务数据（推荐用于迁移）</p>
          <p><strong>内容数据：</strong>仅导出AI工具、资讯、名人堂、大事纪等核心内容</p>
          <p><strong>设置数据：</strong>仅导出站点设置、SMTP配置、SEO设置等</p>
          <p><strong>自定义：</strong>手动选择需要导出的数据表</p>
          <p className="pt-2 border-t border-blue-200 mt-2">
            <strong>合并模式：</strong>保留现有数据，仅添加新数据或更新已存在的数据（推荐）<br/>
            <strong>替换模式：</strong>清空现有数据后导入（谨慎使用，需先备份）
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
