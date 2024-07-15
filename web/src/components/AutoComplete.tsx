import { cn } from '@/utils/style'
import React, { useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Alert } from './Alert'
import { Skeleton } from './Skeleton'

type AutoCompleteProps<TSuggestion, TError> = {
  suggestions: TSuggestion[]
  suggestionLabel: keyof TSuggestion
  inputValue: string
  isDropdownVisible: boolean
  children: React.ReactNode
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSelect: (suggestion: TSuggestion) => void
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  handleInputBlur: (e: React.FocusEvent<HTMLInputElement>) => void
  highlightedIndex: number
  isFetching: boolean
  isError: boolean
  placeholder?: string
  label?: React.ReactNode
  error?: TError
}

type SuggestionListProps<TSuggestion> = {
  wrapperRef: React.RefObject<HTMLDivElement>
  suggestions: TSuggestion[]
  suggestionLabel: keyof TSuggestion
  highlightedIndex: number
  onSelect: (suggestion: TSuggestion) => void
}

export const AutoComplete = <
  TSuggestion extends { id: number },
  TError = Error,
>({
  suggestions,
  suggestionLabel,
  inputValue,
  isDropdownVisible,
  children,
  handleInputChange,
  handleSelect,
  handleKeyDown,
  handleInputBlur,
  highlightedIndex,
  isFetching,
  isError,
  error,
  label,
  placeholder = 'Search',
}: AutoCompleteProps<TSuggestion, TError>) => {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleInputFocus = (e: React.FocusEvent | React.MouseEvent) => {
    e.stopPropagation()
    inputRef.current?.focus()
  }

  let content

  if (isFetching) {
    content = <Skeleton className='h-5 w-full' />
  } else if (isError) {
    content = (
      <Alert severity='error'>
        {error?.toString() || 'Something went wrong'}
      </Alert>
    )
  } else if (isDropdownVisible && suggestions.length > 0) {
    content = (
      <SuggestionList
        wrapperRef={wrapperRef}
        suggestions={suggestions}
        suggestionLabel={suggestionLabel}
        highlightedIndex={highlightedIndex}
        onSelect={handleSelect}
      />
    )
  } else if (isDropdownVisible) {
    content = <small className='text-gray-500'>No results</small>
  }

  return (
    <>
      {label && <label className='mb-1 inline-block'>{label}</label>}
      <div
        tabIndex={0}
        className='relative flex flex-col rounded border p-2 focus-within:border-2 focus-within:border-black'
        ref={wrapperRef}
        onClick={handleInputFocus}
        onFocus={handleInputFocus}
      >
        <div className='flex flex-wrap gap-2'>
          {children}
          <input
            ref={inputRef}
            type='text'
            className='px-1 text-sm outline-none'
            placeholder={placeholder}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={handleInputBlur}
            aria-autocomplete='list'
            aria-controls='suggestion-list'
            aria-activedescendant={`suggestion-${highlightedIndex}`}
          />
        </div>
        {content}
      </div>
    </>
  )
}

const SuggestionList = <TSuggestion extends { id: number }>({
  wrapperRef,
  suggestions,
  suggestionLabel,
  highlightedIndex,
  onSelect,
}: SuggestionListProps<TSuggestion>) => {
  const styles = useMemo(() => {
    const wrapperRect = wrapperRef.current?.getBoundingClientRect()
    return wrapperRect
      ? {
          top: wrapperRect.bottom,
          left: wrapperRect.left,
          width: wrapperRect.width,
        }
      : {}
  }, [wrapperRef])

  return createPortal(
    <ul
      id='suggestion-list'
      className='absolute z-10 overflow-hidden rounded-md border bg-white shadow-lg'
      style={styles}
      role='listbox'
    >
      {suggestions.map((suggestion, index) => (
        <li
          key={suggestion.id}
          className={cn(
            `cursor-pointer px-3 py-2 hover:bg-gray-200`,
            highlightedIndex === index && 'bg-gray-200',
          )}
          role='option'
          aria-selected={highlightedIndex === index}
          onMouseDown={e => {
            e.stopPropagation()
            onSelect(suggestion)
          }}
          tabIndex={-1}
        >
          {suggestion[suggestionLabel] as string}
        </li>
      ))}
    </ul>,
    document.body,
  )
}
