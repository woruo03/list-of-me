// API 响应类型
export interface ApiResponse<T> {
  data?: T
  error?: string
  success: boolean
}

// 分页参数
export interface PaginationParams {
  page?: number
  limit?: number
}

// 排序参数
export interface SortParams {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// 统计摘要
export interface Summary {
  inbox_count: number
  today_count: number
}
