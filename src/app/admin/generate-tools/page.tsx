'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, RefreshCw, CheckCircle, XCircle, Loader2 } from 'lucide-react'

interface TaskStatus {
  total: number
  completed: number
  inserted: number
  skipped: number
  currentBatch: number
  totalBatches: number
  isRunning: boolean
  errors: string[]
}

export default function GenerateToolsPage() {
  const [targetCount, setTargetCount] = useState(5000)
  const [batchSize, setBatchSize] = useState(100)
  const [status, setStatus] = useState<TaskStatus>({
    total: 5000,
    completed: 0,
    inserted: 0,
    skipped: 0,
    currentBatch: 0,
    totalBatches: 50,
    isRunning: false,
    errors: []
  })

  const generateBatch = useCallback(async (existingNames: string[], batch: number) => {
    const response = await fetch('/api/admin/generate-tools', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        existingNames,
        count: batchSize,
        batch
      })
    })
    return response.json()
  }, [batchSize])

  const insertBatch = async (tools: any[]) => {
    const response = await fetch('/api/admin/batch-insert-tools', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tools })
    })
    return response.json()
  }

  const getExistingNames = async (): Promise<string[]> => {
    const response = await fetch('/api/admin/batch-insert-tools')
    const data = await response.json()
    return data.names || []
  }

  const startGeneration = async () => {
    setStatus(prev => ({ ...prev, isRunning: true, errors: [] }))
    
    const totalBatches = Math.ceil(targetCount / batchSize)
    let totalInserted = 0
    let totalSkipped = 0
    const allErrors: string[] = []

    // 获取现有工具名称
    let existingNames = await getExistingNames()
    
    for (let batch = 1; batch <= totalBatches; batch++) {
      if (!status.isRunning && batch > 1) break

      setStatus(prev => ({
        ...prev,
        currentBatch: batch,
        totalBatches,
        completed: prev.completed
      }))

      try {
        // 生成工具
        const generateResult = await generateBatch(existingNames, batch)
        
        if (!generateResult.success) {
          allErrors.push(`批次 ${batch} 生成失败: ${generateResult.error}`)
          continue
        }

        // 插入数据库
        const insertResult = await insertBatch(generateResult.tools)
        
        totalInserted += insertResult.inserted || 0
        totalSkipped += insertResult.skipped || 0

        // 更新现有名称列表
        if (generateResult.tools) {
          existingNames = [...existingNames, ...generateResult.tools.map((t: any) => t.name)]
        }

        setStatus(prev => ({
          ...prev,
          completed: prev.completed + (generateResult.tools?.length || 0),
          inserted: totalInserted,
          skipped: totalSkipped
        }))

        // 添加延迟避免API限流
        await new Promise(resolve => setTimeout(resolve, 1000))

      } catch (error) {
        allErrors.push(`批次 ${batch} 执行错误: ${(error as Error).message}`)
      }
    }

    setStatus(prev => ({
      ...prev,
      isRunning: false,
      errors: allErrors
    }))
  }

  const stopGeneration = () => {
    setStatus(prev => ({ ...prev, isRunning: false }))
  }

  const resetStatus = () => {
    setStatus({
      total: targetCount,
      completed: 0,
      inserted: 0,
      skipped: 0,
      currentBatch: 0,
      totalBatches: Math.ceil(targetCount / batchSize),
      isRunning: false,
      errors: []
    })
  }

  const progress = status.total > 0 ? (status.completed / status.total) * 100 : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">批量生成AI工具</h1>
        <p className="text-muted-foreground">使用AI批量生成并导入AI工具数据</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>生成配置</CardTitle>
            <CardDescription>配置批量生成的参数</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">目标数量</label>
              <input
                type="number"
                value={targetCount}
                onChange={(e) => setTargetCount(Number(e.target.value))}
                disabled={status.isRunning}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">每批数量</label>
              <input
                type="number"
                value={batchSize}
                onChange={(e) => setBatchSize(Number(e.target.value))}
                disabled={status.isRunning}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>执行控制</CardTitle>
            <CardDescription>开始或停止批量生成</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              {!status.isRunning ? (
                <Button onClick={startGeneration} className="flex-1">
                  <Play className="mr-2 h-4 w-4" />
                  开始生成
                </Button>
              ) : (
                <Button onClick={stopGeneration} variant="destructive" className="flex-1">
                  <Pause className="mr-2 h-4 w-4" />
                  停止
                </Button>
              )}
              <Button onClick={resetStatus} variant="outline" disabled={status.isRunning}>
                <RefreshCw className="mr-2 h-4 w-4" />
                重置
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>生成进度</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>进度: {status.completed} / {status.total}</span>
              <span>{progress.toFixed(1)}%</span>
            </div>
            <Progress value={progress} />
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{status.inserted}</div>
              <div className="text-sm text-muted-foreground">已插入</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{status.skipped}</div>
              <div className="text-sm text-muted-foreground">已跳过</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{status.currentBatch} / {status.totalBatches}</div>
              <div className="text-sm text-muted-foreground">当前批次</div>
            </div>
            <div className="text-center">
              <Badge variant={status.isRunning ? "default" : "secondary"}>
                {status.isRunning ? '运行中' : '已停止'}
              </Badge>
            </div>
          </div>

          {status.isRunning && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>正在生成第 {status.currentBatch} 批数据...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {status.errors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              错误日志
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-60 overflow-y-auto space-y-1">
              {status.errors.map((error, index) => (
                <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {error}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {status.completed >= status.total && status.completed > 0 && !status.isRunning && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <div className="font-medium text-green-800">生成完成！</div>
                <div className="text-sm text-green-600">
                  成功插入 {status.inserted} 个工具，跳过 {status.skipped} 个重复工具
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
