import { useContext } from 'react'
import {
  QueryCacheContext,
  QueryCacheDispatchContext,
} from '../contexts/QueryCacheContext'

export const useQueryHasCache = (key: string) => {
  return Boolean(useContext(QueryCacheContext)[key])
}

export const useSetQueryCache = () => {
  const dispatch = useContext(QueryCacheDispatchContext)

  return function (key: string) {
    dispatch({ type: 'REGISTER_QUERY_CACHE', payload: key })
  }
}

export const useInvalidateQueryCache = () => {
  const dispatch = useContext(QueryCacheDispatchContext)

  return function (key: string) {
    dispatch({ type: 'INVALIDATE_QUERY_CACHE', payload: key })
  }
}
