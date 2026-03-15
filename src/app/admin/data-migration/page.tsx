'use client'

import { useState, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Download, Upload, Database, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'

export default function DataMigrationPage() {
  const { user } = useAuth()
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importProgress, setImportProgress] = useState<string>('')
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 检查权限
  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">需要管理员权限访问此页面</p>
      </div>
    )
  }

  // 导出数据
  const handleExport = async () => {
    setExporting(true)
    try {
      const response = await fetch('/api/admin/data/export', {
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      })

      if (!response.ok) {
        throw new Error('导出失败')
      }

      // 获取文件名
      const disposition = response.headers.get('Content-Disposition')
      const filename = disposition?.match(/filename="(.+)"/)?.[1] || `backup-${Date.now()}.json`

      // 下载文件
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      window.URL.revokeObjectURL(url)

      toast.success('数据导出成功')
    } catch (error) {
      console.error('导出失败:', error)
      toast.error('导出失败，请重试')
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">数据迁移</h1>
        <p className="text-muted-foreground mt-1">导出或导入网站数据，用于数据备份和迁移</p>
      </div>

      {/* 使用说明 */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center gap-2">
            <Database className="h-5 w-5" />
            使用说明
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700 text-sm space-y-2">
          <p><strong>导出数据：</strong>将当前环境的数据导出为JSON文件，可用于备份或迁移到其他环境</p>
          <p><strong>导入数据：</strong>将导出的JSON文件导入到当前环境</p>
          <p><strong>合并模式：</strong>保留现有数据，仅添加新数据或更新已存在的数据（推荐）</p>
          <p><strong>替换模式：</strong>清空现有数据后导入（谨慎使用）</p>
        </CardContent>
      </Card>

      {/* 导出功能 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-green-600" />
            导出数据
          </CardTitle>
          <CardDescription>
            将所有业务数据导出为JSON文件
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button onClick={handleExport} disabled={exporting}>
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
            <div className="text-sm text-muted-foreground">
              {importProgress}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 数据统计 */}
      <Card>
        <CardHeader>
          <CardTitle>包含的数据表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            <div className="p-2 bg-muted rounded">AI工具库 (ai_tools)</div>
            <div className="p-2 bg-muted rounded">AI资讯 (ai_news)</div>
            <div className="p-2 bg-muted rounded">AI名人堂 (ai_hall_of_fame)</div>
            <div className="p-2 bg-muted rounded">AI大事纪 (ai_timeline)</div>
            <div className="p-2 bg-muted rounded">分类 (categories)</div>
            <div className="p-2 bg-muted rounded">标签 (tags)</div>
            <div className="p-2 bg-muted rounded">友情链接 (friend_links)</div>
            <div className="p-2 bg-muted rounded">站点设置 (site_settings)</div>
            <div className="p-2 bg-muted rounded">SMTP设置 (smtp_settings)</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
