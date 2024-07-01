export interface IPaginatedResult<TData> {
  data: TData[]
  hasMore: boolean
  cursor: number | null
}

export type TPaginatedParams = {
  limit: number
  cursor: number | null
}
