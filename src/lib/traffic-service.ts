/**
 * 流量数据获取服务
 * 支持多种第三方API：SimilarWeb、SEMrush、Ahrefs等
 */

export interface TrafficData {
  domain: string
  monthlyVisits: number
  monthlyVisitsChange: number
  avgVisitDuration?: number
  pagesPerVisit?: number
  bounceRate?: number
  source: string
  fetchedAt: string
}

export interface TrafficDataSource {
  id: number
  name: string
  display_name: string
  api_key: string | null
  api_endpoint: string | null
  is_active: boolean
  priority: number
  config: any
}

/**
 * 从SimilarWeb API获取流量数据
 */
async function fetchFromSimilarWeb(
  domain: string,
  apiKey: string,
  endpoint?: string
): Promise<TrafficData | null> {
  try {
    const baseUrl = endpoint || 'https://api.similarweb.com/v1/website'
    
    const response = await fetch(
      `${baseUrl}/${domain}/total-traffic-and-engagement/visits?api_key=${apiKey}&start_date=2026-01&end_date=2026-03&country=world&granularity=monthly`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      }
    )
    
    if (!response.ok) {
      console.error(`SimilarWeb API error for ${domain}:`, response.status)
      return null
    }
    
    const data = await response.json()
    
    if (data.visits && data.visits.length > 0) {
      const visits = data.visits
      const latestVisit = visits[visits.length - 1]
      const previousVisit = visits.length > 1 ? visits[visits.length - 2] : null
      
      const monthlyVisits = latestVisit.visits || 0
      const previousVisits = previousVisit?.visits || monthlyVisits
      const change = previousVisits > 0 
        ? ((monthlyVisits - previousVisits) / previousVisits) * 100 
        : 0
      
      return {
        domain,
        monthlyVisits,
        monthlyVisitsChange: parseFloat(change.toFixed(2)),
        avgVisitDuration: data.avg_visit_duration,
        pagesPerVisit: data.pages_per_visit,
        bounceRate: data.bounce_rate,
        source: 'similarweb',
        fetchedAt: new Date().toISOString()
      }
    }
    
    return null
  } catch (error) {
    console.error(`SimilarWeb fetch error for ${domain}:`, error)
    return null
  }
}

/**
 * 从SEMrush API获取流量数据
 */
async function fetchFromSemrush(
  domain: string,
  apiKey: string,
  endpoint?: string
): Promise<TrafficData | null> {
  try {
    const baseUrl = endpoint || 'https://api.semrush.com'
    
    // SEMrush API 使用特定参数格式
    const response = await fetch(
      `${baseUrl}/?type=domain_organic_organic&key=${apiKey}&domain=${domain}&database=us&display_limit=1`,
      {
        method: 'GET'
      }
    )
    
    if (!response.ok) {
      console.error(`SEMrush API error for ${domain}:`, response.status)
      return null
    }
    
    // SEMrush返回CSV格式数据
    const text = await response.text()
    const lines = text.trim().split('\n')
    
    if (lines.length > 1) {
      const values = lines[1].split(';')
      // 解析SEMrush数据格式
      const monthlyVisits = parseInt(values[1]) || 0
      
      return {
        domain,
        monthlyVisits,
        monthlyVisitsChange: 0, // SEMrush需要额外调用获取变化
        source: 'semrush',
        fetchedAt: new Date().toISOString()
      }
    }
    
    return null
  } catch (error) {
    console.error(`SEMrush fetch error for ${domain}:`, error)
    return null
  }
}

/**
 * 从Ahrefs API获取流量数据
 */
async function fetchFromAhrefs(
  domain: string,
  apiKey: string,
  endpoint?: string
): Promise<TrafficData | null> {
  try {
    const baseUrl = endpoint || 'https://api.ahrefs.com'
    
    const response = await fetch(
      `${baseUrl}/v3/site-explorer/overview?api_key=${apiKey}&target=${domain}&output=json`,
      {
        method: 'GET'
      }
    )
    
    if (!response.ok) {
      console.error(`Ahrefs API error for ${domain}:`, response.status)
      return null
    }
    
    const data = await response.json()
    
    if (data.metrics) {
      return {
        domain,
        monthlyVisits: data.metrics.org_traffic || 0,
        monthlyVisitsChange: 0,
        source: 'ahrefs',
        fetchedAt: new Date().toISOString()
      }
    }
    
    return null
  } catch (error) {
    console.error(`Ahrefs fetch error for ${domain}:`, error)
    return null
  }
}

/**
 * 生成模拟流量数据（作为备用方案）
 */
function generateMockTrafficData(domain: string): TrafficData {
  const baseVisits = Math.floor(Math.random() * 10000000) + 100000
  const change = parseFloat((Math.random() * 40 - 10).toFixed(2))
  
  return {
    domain,
    monthlyVisits: baseVisits,
    monthlyVisitsChange: change,
    avgVisitDuration: Math.floor(Math.random() * 300) + 60,
    pagesPerVisit: parseFloat((Math.random() * 5 + 1).toFixed(2)),
    bounceRate: parseFloat((Math.random() * 50 + 30).toFixed(2)),
    source: 'mock',
    fetchedAt: new Date().toISOString()
  }
}

/**
 * 从URL中提取域名
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
    return urlObj.hostname.replace('www.', '')
  } catch {
    return url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0]
  }
}

/**
 * 根据配置的数据源获取流量数据
 */
export async function fetchTrafficData(
  website: string,
  dataSource: TrafficDataSource
): Promise<TrafficData> {
  const domain = extractDomain(website)
  
  // 如果是模拟数据源或没有API密钥，返回模拟数据
  if (dataSource.name === 'mock' || !dataSource.api_key) {
    return generateMockTrafficData(domain)
  }
  
  let result: TrafficData | null = null
  
  switch (dataSource.name) {
    case 'similarweb':
      result = await fetchFromSimilarWeb(domain, dataSource.api_key, dataSource.api_endpoint || undefined)
      break
    case 'semrush':
      result = await fetchFromSemrush(domain, dataSource.api_key, dataSource.api_endpoint || undefined)
      break
    case 'ahrefs':
      result = await fetchFromAhrefs(domain, dataSource.api_key, dataSource.api_endpoint || undefined)
      break
    default:
      console.warn(`Unknown data source: ${dataSource.name}`)
  }
  
  // 如果获取失败，返回模拟数据作为备用
  if (!result) {
    console.log(`Falling back to mock data for ${domain}`)
    return generateMockTrafficData(domain)
  }
  
  return result
}

/**
 * 批量获取流量数据
 */
export async function batchFetchTrafficData(
  websites: string[],
  dataSource: TrafficDataSource,
  concurrency: number = 5
): Promise<Map<string, TrafficData>> {
  const results = new Map<string, TrafficData>()
  
  // 分批处理，避免API限流
  for (let i = 0; i < websites.length; i += concurrency) {
    const batch = websites.slice(i, i + concurrency)
    const promises = batch.map(async (website) => {
      const data = await fetchTrafficData(website, dataSource)
      results.set(website, data)
    })
    
    await Promise.all(promises)
    
    // 批次间暂停，避免API限流
    if (i + concurrency < websites.length) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  
  return results
}
