import { createContext } from 'react'

export type QueryCache = Record<string, boolean>

export type QueryCacheDispatch = React.Dispatch<{
  type: 'REGISTER_QUERY_CACHE' | 'INVALIDATE_QUERY_CACHE'
  payload: string
}>

export const QueryCacheContext = createContext<QueryCache>({})
export const QueryCacheDispatchContext = createContext<QueryCacheDispatch>(
  {} as QueryCacheDispatch,
)
