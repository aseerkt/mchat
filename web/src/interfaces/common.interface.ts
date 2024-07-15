export interface IPaginatedResult<
  TData extends { id: number },
  TCursor extends number | string = number,
> {
  data: TData[]
  hasMore: boolean
  cursor: TCursor | null
}

export type TPaginatedParams<TCursor extends string | number = number> = {
  limit: number
  cursor: TCursor | null
}
