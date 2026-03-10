// 用户角色
export type UserRole = 'user' | 'publisher' | 'admin'

// 工具状态
export type ToolStatus = 'pending' | 'approved' | 'rejected'

// 用户信息
export interface User {
  id: string
  email: string
  name: string | null
  avatar: string | null
  role: UserRole
  bio: string | null
  website: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string | null
}

// 分类
export interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string | null
  parentId: number | null
  sortOrder: number
  isActive: boolean
  createdAt: string
  toolCount?: number
}

// 标签
export interface Tag {
  id: number
  name: string
  slug: string
  createdAt: string
}

// AI工具
export interface AiTool {
  id: number
  name: string
  slug: string
  description: string
  longDescription: string | null
  website: string
  logo: string | null
  screenshots: string[] | null
  categoryId: number
  publisherId: string
  status: ToolStatus
  isFeatured: boolean
  isFree: boolean
  pricingInfo: string | null
  viewCount: number
  favoriteCount: number
  rejectReason: string | null
  createdAt: string
  updatedAt: string | null
  category?: Category
  publisher?: User
  tags?: Tag[]
  isFavorited?: boolean
  avgRating?: number
  reviewCount?: number
}

// 评论
export interface Comment {
  id: number
  toolId: number
  userId: string
  content: string
  rating: number | null
  parentId: number | null
  isHidden: boolean
  createdAt: string
  updatedAt: string | null
  user?: User
  replies?: Comment[]
}

// API 响应
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

// 分页参数
export interface PaginationParams {
  page?: number
  limit?: number
}

// 分页响应
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
