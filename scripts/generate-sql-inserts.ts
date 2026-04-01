/**
 * SQL插入语句生成脚本
 * 用于将导出的JSON数据转换为SQL INSERT语句
 */

import * as fs from 'fs'
import * as path from 'path'

interface TableData {
  [tableName: string]: any[]
}

// 读取导出的JSON数据
const exportDataPath = path.join(process.cwd(), 'database', 'export-data.json')
const allData: TableData = JSON.parse(fs.readFileSync(exportDataPath, 'utf-8'))

/**
 * 转义SQL字符串中的特殊字符
 */
function escapeSql(value: any): string {
  if (value === null || value === undefined) {
    return 'NULL'
  }
  
  if (typeof value === 'number') {
    return String(value)
  }
  
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false'
  }
  
  if (Array.isArray(value)) {
    const escapedArray = value.map(item => {
      if (typeof item === 'string') {
        return `"${item.replace(/"/g, '\\"')}"`
      }
      return item
    })
    return `ARRAY[${escapedArray.join(', ')}]`
  }
  
  if (typeof value === 'object') {
    return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`
  }
  
  // 字符串处理
  const strValue = String(value)
  return `'${strValue.replace(/'/g, "''")}'`
}

/**
 * 生成INSERT语句
 */
function generateInsert(tableName: string, data: any[]): string {
  if (!data || data.length === 0) {
    return `-- 表 ${tableName} 无数据\n`
  }
  
  const columns = Object.keys(data[0])
  const values = data.map(row => {
    const rowValues = columns.map(col => escapeSql(row[col]))
    return `(${rowValues.join(', ')})`
  })
  
  const sql = `-- ============================================
-- 表: ${tableName}
-- 记录数: ${data.length}
-- ============================================

INSERT INTO ${tableName} (${columns.join(', ')}) VALUES
${values.join(',\n')};
`
  return sql
}

/**
 * 生成所有SQL文件
 */
function generateAllSqlFiles() {
  const outputDir = path.join(process.cwd(), 'database')
  
  // 生成分类数据
  console.log('生成 01_categories.sql...')
  const categoriesSql = generateInsert('categories', allData.categories)
  fs.writeFileSync(path.join(outputDir, '01_categories.sql'), categoriesSql)
  
  // 生成标签数据
  console.log('生成 02_tags.sql...')
  const tagsSql = generateInsert('tags', allData.tags)
  fs.writeFileSync(path.join(outputDir, '02_tags.sql'), tagsSql)
  
  // 生成AI名人堂数据
  console.log('生成 03_ai_hall_of_fame.sql...')
  const hallOfFameSql = generateInsert('ai_hall_of_fame', allData.ai_hall_of_fame)
  fs.writeFileSync(path.join(outputDir, '03_ai_hall_of_fame.sql'), hallOfFameSql)
  
  // 生成用户数据
  console.log('生成 04_users.sql...')
  const usersSql = generateInsert('users', allData.users)
  fs.writeFileSync(path.join(outputDir, '04_users.sql'), usersSql)
  
  // 生成AI工具数据（数据量大，分批处理）
  console.log('生成 05_ai_tools.sql...')
  const toolsSql = generateInsert('ai_tools', allData.ai_tools)
  fs.writeFileSync(path.join(outputDir, '05_ai_tools.sql'), toolsSql)
  
  // 生成AI大事纪数据
  console.log('生成 06_ai_timeline.sql...')
  const timelineSql = generateInsert('ai_timeline', allData.ai_timeline)
  fs.writeFileSync(path.join(outputDir, '06_ai_timeline.sql'), timelineSql)
  
  // 生成工具标签关联数据
  console.log('生成 07_tool_tags.sql...')
  const toolTagsSql = generateInsert('tool_tags', allData.tool_tags)
  fs.writeFileSync(path.join(outputDir, '07_tool_tags.sql'), toolTagsSql)
  
  // 生成评论数据
  console.log('生成 08_comments.sql...')
  const commentsSql = generateInsert('comments', allData.comments)
  fs.writeFileSync(path.join(outputDir, '08_comments.sql'), commentsSql)
  
  // 生成发布者申请数据
  console.log('生成 09_publisher_applications.sql...')
  const publisherAppsSql = generateInsert('publisher_applications', allData.publisher_applications)
  fs.writeFileSync(path.join(outputDir, '09_publisher_applications.sql'), publisherAppsSql)
  
  // 生成排行榜数据
  console.log('生成 10_ai_tool_rankings.sql...')
  const rankingsSql = generateInsert('ai_tool_rankings', allData.ai_tool_rankings)
  fs.writeFileSync(path.join(outputDir, '10_ai_tool_rankings.sql'), rankingsSql)
  
  // 生成排行榜更新日志
  console.log('生成 11_ranking_update_log.sql...')
  const rankingLogSql = generateInsert('ranking_update_log', allData.ranking_update_log)
  fs.writeFileSync(path.join(outputDir, '11_ranking_update_log.sql'), rankingLogSql)
  
  // 生成SEO设置
  console.log('生成 12_seo_settings.sql...')
  const seoSettingsSql = generateInsert('seo_settings', allData.seo_settings)
  fs.writeFileSync(path.join(outputDir, '12_seo_settings.sql'), seoSettingsSql)
  
  // 生成网站设置
  console.log('生成 13_site_settings.sql...')
  const siteSettingsSql = generateInsert('site_settings', allData.site_settings)
  fs.writeFileSync(path.join(outputDir, '13_site_settings.sql'), siteSettingsSql)
  
  // 生成流量数据源配置
  console.log('生成 14_traffic_data_sources.sql...')
  const trafficDataSourcesSql = generateInsert('traffic_data_sources', allData.traffic_data_sources)
  fs.writeFileSync(path.join(outputDir, '14_traffic_data_sources.sql'), trafficDataSourcesSql)
  
  console.log('\n所有SQL文件生成完成！')
  console.log(`输出目录: ${outputDir}`)
}

// 执行生成
generateAllSqlFiles()
