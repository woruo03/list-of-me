// API 响应类型
interface ApiResponse<T> {
  data?: T
  error?: string
  success: boolean
}

// 分页参数
interface PaginationParams {
  page?: number
  limit?: number
}

// 排序参数
interface SortParams {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export type { ApiResponse, PaginationParams, SortParams }
