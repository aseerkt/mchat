import React, { useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Input } from './Input'

type AutoCompleteProps<TSuggestion, TError> = {
  suggestions: TSuggestion[]
  suggestionLabel: keyof TSuggestion
  inputValue: string
  isDropdownVisible: boolean
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

  return (
    <div className='relative flex flex-col' ref={wrapperRef}>
      <Input
        type='search'
        placeholder={placeholder}
        value={inputValue}
        label={label}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleInputBlur}
        aria-autocomplete='list'
        aria-controls='suggestion-list'
        aria-activedescendant={`suggestion-${highlightedIndex}`}
      />
      {isFetching && <p>Loading...</p>}
      {isError && <p>Error: {error?.toString()}</p>}
      {isDropdownVisible && suggestions.length > 0 && (
        <SuggestionList
          wrapperRef={wrapperRef}
          suggestions={suggestions}
          suggestionLabel={suggestionLabel}
          highlightedIndex={highlightedIndex}
          onSelect={handleSelect}
        />
      )}
    </div>
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
          top: wrapperRect.bottom - 15,
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
          id={`suggestion-${index}`}
          className={`cursor-pointer px-3 py-2 hover:bg-gray-200 ${highlightedIndex === index ? 'bg-gray-200' : ''}`}
          role='option'
          aria-selected={highlightedIndex === index}
          onMouseDown={e => {
            e.stopPropagation()
            onSelect(suggestion)
          }}
        >
          {suggestion[suggestionLabel] as string}
        </li>
      ))}
    </ul>,
    document.body,
  )
}
