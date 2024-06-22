import { useReducer } from 'react'
import {
  QueryCache,
  QueryCacheContext,
  QueryCacheDispatchContext,
} from '../contexts/QueryCacheContext'

const initialState: QueryCache = {}

function cacheReducer(
  state = initialState,
  action: {
    type: 'REGISTER_QUERY_CACHE' | 'INVALIDATE_QUERY_CACHE'
    payload: string
  },
) {
  switch (action.type) {
    case 'REGISTER_QUERY_CACHE':
      return { ...state, [action.payload]: true }
    case 'INVALIDATE_QUERY_CACHE':
      delete state[action.payload]
      return {
        ...state,
      }
    default:
      return state
  }
}

export const QueryCacheProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [cache, dispatch] = useReducer(cacheReducer, initialState)

  return (
    <QueryCacheDispatchContext.Provider value={dispatch}>
      <QueryCacheContext.Provider value={cache}>
        {children}
      </QueryCacheContext.Provider>
    </QueryCacheDispatchContext.Provider>
  )
}
