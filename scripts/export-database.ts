/**
 * 数据库导出脚本
 * 用于将Supabase数据库中的所有数据导出为SQL初始化脚本
 */

import { getSupabaseClient } from '../src/storage/database/supabase-client'
import * as fs from 'fs'
import * as path from 'path'

interface TableData {
  tableName: string
  data: any[]
}

async function exportAllTables() {
  console.log('开始导出数据库...')
  
  const client = getSupabaseClient()
  const exportDir = path.join(process.cwd(), 'database')
  
  // 确保导出目录存在
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true })
  }
  
  // 定义需要导出的表
  const tables = [
    'categories',
    'tags', 
    'users',
    'ai_tools',
    'tool_tags',
    'ai_hall_of_fame',
    'ai_timeline',
    'favorites',
    'comments',
    'publisher_applications',
    'ai_tool_rankings',
    'ranking_update_log',
    'seo_settings',
    'site_settings',
    'traffic_data_sources',
    'health_check'
  ]
  
  const allData: Record<string, any[]> = {}
  
  // 导出每个表的数据
  for (const table of tables) {
    console.log(`正在导出表: ${table}`)
    
    const { data, error } = await client
      .from(table)
      .select('*')
    
    if (error) {
      console.error(`导出表 ${table} 失败:`, error.message)
      allData[table] = []
    } else {
      allData[table] = data || []
      console.log(`表 ${table} 导出完成，共 ${data?.length || 0} 条记录`)
    }
  }
  
  // 将数据保存为JSON文件
  const jsonPath = path.join(exportDir, 'export-data.json')
  fs.writeFileSync(jsonPath, JSON.stringify(allData, null, 2))
  console.log(`\n数据已导出到: ${jsonPath}`)
  
  return allData
}

// 执行导出
exportAllTables()
  .then(() => {
    console.log('\n数据库导出完成！')
    process.exit(0)
  })
  .catch((error) => {
    console.error('导出失败:', error)
    process.exit(1)
  })
