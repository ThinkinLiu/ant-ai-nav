'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Play, Pause, RefreshCw, CheckCircle, XCircle, Loader2, Database, ChevronDown, ChevronUp } from 'lucide-react'

interface ImportedTool {
  name: string
  description: string
  category: string
  status: 'success' | 'skipped' | 'error'
}

interface BatchResult {
  batch: number
  generated: number
  inserted: number
  skipped: number
  tools: ImportedTool[]
  error?: string
}

interface TaskStatus {
  targetTotal: number
  completed: number
  inserted: number
  skipped: number
  failed: number
  currentBatch: number
  totalBatches: number
  isRunning: boolean
  batchResults: BatchResult[]
}

export default function GenerateToolsPage() {
  const [targetCount, setTargetCount] = useState(5000)
  const [batchSize, setBatchSize] = useState(100)
  const [showDetails, setShowDetails] = useState(true)
  const [status, setStatus] = useState<TaskStatus>({
    targetTotal: 5000,
    completed: 0,
    inserted: 0,
    skipped: 0,
    failed: 0,
    currentBatch: 0,
    totalBatches: 50,
    isRunning: false,
    batchResults: []
  })

  // 动态更新totalBatches
  useEffect(() => {
    if (!status.isRunning) {
      setStatus(prev => ({
        ...prev,
        targetTotal: targetCount,
        totalBatches: Math.ceil(targetCount / batchSize)
      }))
    }
  }, [targetCount, batchSize, status.isRunning])

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

  const getCategoryName = (categoryId: number): string => {
    const categories: Record<number, string> = {
      1: 'AI写作',
      2: 'AI绘画',
      3: 'AI对话',
      4: 'AI编程',
      5: 'AI音频',
      6: 'AI视频',
      7: 'AI办公',
      8: 'AI学习'
    }
    return categories[categoryId] || '未分类'
  }

  const startGeneration = async () => {
    const totalBatches = Math.ceil(targetCount / batchSize)
    
    setStatus(prev => ({ 
      ...prev, 
      isRunning: true, 
      targetTotal: targetCount,
      totalBatches,
      completed: 0,
      inserted: 0,
      skipped: 0,
      failed: 0,
      currentBatch: 0,
      batchResults: []
    }))
    
    let totalInserted = 0
    let totalSkipped = 0
    let totalFailed = 0
    const allBatchResults: BatchResult[] = []

    // 获取现有工具名称
    let existingNames = await getExistingNames()
    
    for (let batch = 1; batch <= totalBatches; batch++) {
      // 检查是否已停止
      setStatus(prev => {
        if (!prev.isRunning && batch > 1) {
          return prev
        }
        return {
          ...prev,
          currentBatch: batch,
        }
      })

      // 检查停止标志
      let shouldStop = false
      setStatus(prev => {
        if (!prev.isRunning) {
          shouldStop = true
        }
        return prev
      })
      if (shouldStop && batch > 1) break

      const batchResult: BatchResult = {
        batch,
        generated: 0,
        inserted: 0,
        skipped: 0,
        tools: []
      }

      try {
        // 生成工具
        const generateResult = await generateBatch(existingNames, batch)
        
        if (!generateResult.success) {
          batchResult.error = generateResult.error || '生成失败'
          batchResult.generated = 0
          totalFailed += batchSize
          allBatchResults.push(batchResult)
          
          setStatus(prev => ({
            ...prev,
            completed: prev.completed + batchSize,
            failed: totalFailed,
            batchResults: [...allBatchResults]
          }))
          continue
        }

        batchResult.generated = generateResult.generated || generateResult.tools?.length || 0
        
        // 如果生成数量为0，记录警告但继续
        if (batchResult.generated === 0) {
          batchResult.error = 'LLM未返回有效数据'
          allBatchResults.push(batchResult)
          setStatus(prev => ({
            ...prev,
            completed: prev.completed + batchSize,
            batchResults: [...allBatchResults]
          }))
          continue
        }

        // 插入数据库
        const insertResult = await insertBatch(generateResult.tools || [])
        
        batchResult.inserted = insertResult.inserted || 0
        batchResult.skipped = insertResult.skipped || 0

        totalInserted += insertResult.inserted || 0
        totalSkipped += insertResult.skipped || 0

        // 记录每个工具的导入结果
        if (generateResult.tools && generateResult.tools.length > 0) {
          const insertedSet = new Set(insertResult.insertedTools || [])
          const skippedSet = new Set(insertResult.skippedTools || [])
          
          generateResult.tools.forEach((tool: any) => {
            let toolStatus: 'success' | 'skipped' | 'error' = 'skipped'
            if (insertedSet.has(tool.name)) {
              toolStatus = 'success'
            } else if (skippedSet.has(tool.name)) {
              toolStatus = 'skipped'
            } else if (insertResult.inserted > 0 && !skippedSet.has(tool.name)) {
              toolStatus = 'success'
            }
            
            batchResult.tools.push({
              name: tool.name,
              description: tool.description,
              category: getCategoryName(tool.category_id),
              status: toolStatus
            })
          })
          
          // 更新现有名称列表
          existingNames = [...existingNames, ...generateResult.tools.map((t: any) => t.name)]
        }

        allBatchResults.push(batchResult)

        setStatus(prev => ({
          ...prev,
          completed: prev.completed + batchResult.generated,
          inserted: totalInserted,
          skipped: totalSkipped,
          batchResults: [...allBatchResults]
        }))

        // 添加延迟避免API限流
        await new Promise(resolve => setTimeout(resolve, 1000))

      } catch (error) {
        batchResult.error = (error as Error).message
        batchResult.generated = 0
        totalFailed += batchSize
        allBatchResults.push(batchResult)
        
        setStatus(prev => ({
          ...prev,
          completed: prev.completed + batchSize,
          failed: totalFailed,
          batchResults: [...allBatchResults]
        }))
      }
    }

    setStatus(prev => ({
      ...prev,
      isRunning: false
    }))
  }

  const stopGeneration = () => {
    setStatus(prev => ({ ...prev, isRunning: false }))
  }

  const resetStatus = () => {
    setStatus({
      targetTotal: targetCount,
      completed: 0,
      inserted: 0,
      skipped: 0,
      failed: 0,
      currentBatch: 0,
      totalBatches: Math.ceil(targetCount / batchSize),
      isRunning: false,
      batchResults: []
    })
  }

  const progress = status.targetTotal > 0 ? (status.completed / status.targetTotal) * 100 : 0

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
                onChange={(e) => setTargetCount(Math.max(1, Number(e.target.value)))}
                disabled={status.isRunning}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <p className="text-xs text-muted-foreground">当前将生成 {targetCount} 个工具</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">每批数量</label>
              <input
                type="number"
                value={batchSize}
                onChange={(e) => setBatchSize(Math.max(1, Math.min(200, Number(e.target.value))))}
                disabled={status.isRunning}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <p className="text-xs text-muted-foreground">共需 {Math.ceil(targetCount / batchSize)} 批次</p>
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
          <CardDescription>
            目标: {status.targetTotal} 个工具，共 {status.totalBatches} 批次
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>进度: {status.completed} / {status.targetTotal}</span>
              <span>{progress.toFixed(1)}%</span>
            </div>
            <Progress value={progress} />
          </div>

          <div className="grid grid-cols-5 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-600">{status.inserted}</div>
              <div className="text-xs text-muted-foreground">已插入</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{status.skipped}</div>
              <div className="text-xs text-muted-foreground">已跳过</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-red-600">{status.failed}</div>
              <div className="text-xs text-muted-foreground">失败</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{status.currentBatch} / {status.totalBatches}</div>
              <div className="text-xs text-muted-foreground">当前批次</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <Badge variant={status.isRunning ? "default" : "secondary"} className="mt-1">
                {status.isRunning ? '运行中' : '已停止'}
              </Badge>
            </div>
          </div>

          {status.isRunning && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>正在生成第 {status.currentBatch} 批数据...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 详细结果展示 */}
      <Card>
        <CardHeader>
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center justify-between w-full text-left"
          >
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                导入详细结果
              </CardTitle>
              <CardDescription>
                共 {status.batchResults.length} 批次，{status.batchResults.reduce((sum, b) => sum + b.tools.length, 0)} 个工具
              </CardDescription>
            </div>
            {showDetails ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </CardHeader>
        
        {showDetails && (
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              {status.batchResults.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  暂无导入记录，点击"开始生成"开始批量导入
                </div>
              ) : (
                <div className="space-y-4">
                  {status.batchResults.map((batch) => (
                    <div key={batch.batch} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">批次 {batch.batch}</Badge>
                          {batch.error ? (
                            <Badge variant="destructive">
                              <XCircle className="h-3 w-3 mr-1" />
                              失败
                            </Badge>
                          ) : (
                            <Badge variant="default" className="bg-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              成功
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          生成: {batch.generated} | 插入: {batch.inserted} | 跳过: {batch.skipped}
                        </div>
                      </div>
                      
                      {batch.error ? (
                        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                          {batch.error}
                        </div>
                      ) : (
                        <div className="grid gap-2">
                          {batch.tools.map((tool, idx) => (
                            <div 
                              key={idx} 
                              className={`flex items-center justify-between text-sm p-2 rounded ${
                                tool.status === 'success' 
                                  ? 'bg-green-50 text-green-800' 
                                  : 'bg-yellow-50 text-yellow-800'
                              }`}
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                {tool.status === 'success' ? (
                                  <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-yellow-600 shrink-0" />
                                )}
                                <span className="font-medium truncate">{tool.name}</span>
                                <Badge variant="secondary" className="shrink-0">{tool.category}</Badge>
                              </div>
                              <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {tool.description}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        )}
      </Card>

      {status.completed >= status.targetTotal && status.completed > 0 && !status.isRunning && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <div className="font-medium text-green-800">生成完成！</div>
                <div className="text-sm text-green-600">
                  成功插入 {status.inserted} 个工具，跳过 {status.skipped} 个重复工具
                  {status.failed > 0 && `，失败 ${status.failed} 个`}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
