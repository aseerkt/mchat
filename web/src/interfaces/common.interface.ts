export interface IPaginatedResult<TData> {
  data: TData[]
  hasMore: boolean
  cursor: string
}

export type TPaginatedParams = {
  limit: number
  cursor: string
}
