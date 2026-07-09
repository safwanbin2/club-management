export type ApiResponse<TData> = {
  code: string
  data: TData
  message?: string
  status: 'error' | 'success'
}

export type PaginatedData<TItem> = {
  currentPage: number
  currentTotal: number
  data: TItem[]
  lastPage: number
  perPage: number
  total: number
}
