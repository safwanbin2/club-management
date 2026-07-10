export type PaginatedResult<TItem> = {
  currentPage: number
  currentTotal: number
  data: TItem[]
  lastPage: number
  perPage: number
  total: number
}
