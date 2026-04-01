// 结构化数据 - JSON-LD格式
// 用于搜索引擎更好地理解网站内容

export interface OrganizationSchema {
  '@context': string
  '@type': string
  name: string
  url: string
  logo: string
  description: string
  sameAs?: string[]
}

export interface WebSiteSchema {
  '@context': string
  '@type': string
  name: string
  url: string
  description: string
  potentialAction: {
    '@type': string
    target: string | { '@type': string; urlTemplate: string }
    'query-input'?: string
  }
}

export interface SoftwareApplicationSchema {
  '@context': string
  '@type': string
  name: string
  description: string
  url: string
  applicationCategory: string
  operatingSystem: string
  offers?: {
    '@type': string
    price: string
    priceCurrency: string
  }
  aggregateRating?: {
    '@type': string
    ratingValue: string
    ratingCount: string
  }
}

// 网站组织结构化数据
export function getOrganizationSchema(baseUrl: string): OrganizationSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '蚂蚁AI导航',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: '蚂蚁AI导航是一个专注于AI工具的资源导航平台，帮助用户发现和使用最优秀的AI产品。',
  }
}

// 网站搜索结构化数据
export function getWebSiteSchema(baseUrl: string): WebSiteSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '蚂蚁AI导航',
    url: baseUrl,
    description: '发现最好的AI工具',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

// 面包屑导航结构化数据
export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

// AI工具结构化数据
export function getToolSchema(tool: {
  name: string
  description: string
  url: string
  website: string
  isFree: boolean
  category?: string
  rating?: number
  ratingCount?: number
}): SoftwareApplicationSchema {
  const schema: SoftwareApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    description: tool.description,
    url: tool.url,
    applicationCategory: tool.category || 'UtilitiesApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: tool.isFree ? '0' : 'Contact for pricing',
      priceCurrency: 'CNY',
    },
  }

  if (tool.rating && tool.ratingCount) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: tool.rating.toString(),
      ratingCount: tool.ratingCount.toString(),
    }
  }

  return schema
}

// 文章/列表结构化数据
export function getItemListSchema(items: { name: string; url: string; description?: string }[], baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`,
      description: item.description,
    })),
  }
}
