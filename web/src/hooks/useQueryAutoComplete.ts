import {
  DefaultError,
  DefinedInitialDataOptions,
  QueryKey,
  useQuery,
} from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'
import { useDebounce } from './useDebounce'
import { useDisclosure } from './useDisclosure'

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
  const {
    isOpen: isDropdownVisible,
    open: openDropdown,
    close: closeDropdown,
  } = useDisclosure()

  const {
    data: suggestions,
    isFetching,
    isError,
    error,
  } = useQuery({
    ...options,
    enabled: options.enabled && search.length > 1,
    queryKey: [...options.queryKey, search] as unknown as TQueryKey,
  })

  useEffect(() => {
    inputValue.length > 1 ? openDropdown() : closeDropdown()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue])

  const handleInputBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      e.stopPropagation()
      setTimeout(closeDropdown, 100)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation()
      setInputValue(e.target.value)
    },
    [],
  )

  const handleSelect = useCallback((suggestion: TQueryFnData) => {
    setInputValue('')
    onSelect(suggestion)
    closeDropdown()
    setHighlightedIndex(-1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      e.stopPropagation()
      if (suggestions && suggestions.length > 0) {
        if (e.key === 'ArrowDown') {
          setHighlightedIndex(prevIndex =>
            prevIndex === suggestions.length - 1 ? 0 : prevIndex + 1,
          )
          openDropdown()
        } else if (e.key === 'ArrowUp') {
          setHighlightedIndex(prevIndex =>
            prevIndex === 0 ? suggestions.length - 1 : prevIndex - 1,
          )
          openDropdown()
        } else if (e.key === 'Enter' && highlightedIndex >= 0) {
          handleSelect(suggestions[highlightedIndex])
        } else if (e.key === 'Tab') {
          closeDropdown()
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [highlightedIndex, suggestions],
  )

  return {
    inputValue,
    handleInputChange,
    handleInputBlur,
    handleKeyDown,
    isDropdownVisible,
    handleSelect,
    highlightedIndex,
    suggestions,
    isFetching,
    isError,
    error,
  }
}
