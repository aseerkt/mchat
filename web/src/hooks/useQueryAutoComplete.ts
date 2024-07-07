import {
  DefaultError,
  DefinedInitialDataOptions,
  QueryKey,
  useQuery,
} from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'
import { useDebounce } from './useDebounce'

export const useQueryAutoComplete = <
  TQueryFnData extends { id: number },
  TData extends TQueryFnData[],
  TError = DefaultError,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: DefinedInitialDataOptions<TData, TError, TData, TQueryKey>,
  {
    onSelect,
  }: {
    onSelect: (suggestion: TQueryFnData) => void
  },
) => {
  const [inputValue, setInputValue] = useState('')
  const search = useDebounce(inputValue)

  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1)
  const [isDropdownVisible, setIsDropdownVisible] = useState<boolean>(true)

  const {
    data: suggestions,
    isFetching,
    isError,
    error,
  } = useQuery({
    enabled: search.length > 1,
    ...options,
    queryKey: [...options.queryKey, search] as unknown as TQueryKey,
  })

  useEffect(() => {
    if (inputValue.length > 1) {
      setIsDropdownVisible(true)
    } else {
      setIsDropdownVisible(false)
    }
  }, [inputValue])

  const handleInputBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      e.stopPropagation()
      setTimeout(() => setIsDropdownVisible(false), 100)
    },
    [],
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation()
      setInputValue(e.target.value)
    },
    [],
  )

  const handleSelect = useCallback(
    (suggestion: TQueryFnData) => {
      setInputValue('')
      onSelect(suggestion)
      setIsDropdownVisible(false)
      setHighlightedIndex(-1)
    },
    [onSelect],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      e.stopPropagation()
      if (suggestions.length > 0) {
        if (e.key === 'ArrowDown') {
          setHighlightedIndex(prevIndex =>
            prevIndex === suggestions.length - 1 ? 0 : prevIndex + 1,
          )
          setIsDropdownVisible(true)
        } else if (e.key === 'ArrowUp') {
          setHighlightedIndex(prevIndex =>
            prevIndex === 0 ? suggestions.length - 1 : prevIndex - 1,
          )
          setIsDropdownVisible(true)
        } else if (e.key === 'Enter' && highlightedIndex >= 0) {
          handleSelect(suggestions[highlightedIndex])
        } else if (e.key === 'Tab') {
          setIsDropdownVisible(false)
        }
      }
    },
    [highlightedIndex, suggestions, handleSelect],
  )

  return {
    inputValue,
    handleInputChange,
    handleInputBlur,
    handleKeyDown,
    isDropdownVisible: isDropdownVisible && suggestions.length > 0,
    handleSelect,
    highlightedIndex,
    suggestions,
    isFetching,
    isError,
    error,
  }
}
