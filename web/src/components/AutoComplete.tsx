import React, { useRef } from 'react'
import { Alert } from './Alert'
import { Menu, MenuItem } from './Menu'
import { Skeleton } from './Skeleton'

type AutoCompleteProps<TSuggestion, TError> = {
  suggestions: TSuggestion[]
  suggestionLabel: keyof TSuggestion
  inputValue: string
  isDropdownVisible: boolean
  children: React.ReactNode
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSelect: (suggestion: TSuggestion) => void
  handleInputBlur: (e: React.FocusEvent<HTMLInputElement>) => void
  isFetching: boolean
  isError: boolean
  placeholder?: string
  label?: React.ReactNode
  error?: TError
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
  handleInputBlur,
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
      <Menu
        id='suggestion-list'
        className='overflow-hidden rounded-md'
        anchorRef={wrapperRef}
        anchorFullWidth
        role='listbox'
        onEnter={highlightedIndex =>
          handleSelect(suggestions[highlightedIndex])
        }
      >
        {suggestions.map(suggestion => (
          <MenuItem
            key={suggestion.id}
            role='option'
            onSelect={() => handleSelect(suggestion)}
          >
            {suggestion[suggestionLabel] as string}
          </MenuItem>
        ))}
      </Menu>
    )
  } else if (isDropdownVisible) {
    content = (
      <Alert severity='info' size='sm' className='mt-2'>
        No results
      </Alert>
    )
  }

  return (
    <>
      {label && <label className='mb-1 inline-block'>{label}</label>}
      <div
        tabIndex={0}
        className='relative flex flex-col rounded p-2 ring-1 ring-gray-400 focus-within:ring-2 focus-within:ring-black'
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
            onBlur={handleInputBlur}
            aria-autocomplete='list'
            aria-controls='suggestion-list'
          />
        </div>
        {content}
      </div>
    </>
  )
}
