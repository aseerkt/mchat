import { useDisclosure } from '@/hooks/useDisclosure'
import { cn } from '@/utils/style'
import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export const Select = <TValue extends number | string>(props: {
  options: {
    label: React.ReactNode
    value: TValue
    disabled?: boolean
  }[]
  value: TValue
  disabled?: boolean
  displayValue?: (value: TValue) => React.ReactNode
  placeholder?: string
  onSelect: (value: TValue) => void
}) => {
  const {
    options,
    value,
    onSelect,
    displayValue = value => value,
    placeholder,
    disabled,
  } = props

  const wrapperRef = useRef<HTMLDivElement>(null)
  const { isOpen, toggle, close } = useDisclosure()
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  const selectStyles = (() => {
    const wrapperRect = wrapperRef.current?.getBoundingClientRect()
    if (!wrapperRect) return
    return {
      width: wrapperRect.width,
      top: wrapperRect.bottom,
      left: wrapperRect.left,
    }
  })()

  const handleSelect = (option: (typeof options)[0]) => {
    if (!option.disabled || option.value === value) {
      onSelect(option.value)
      close()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation()
    switch (e.key) {
      case 'ArrowDown':
        setHighlightedIndex(prevIndex =>
          prevIndex >= options.length - 1 ? 0 : prevIndex + 1,
        )
        break
      case 'ArrowUp':
        setHighlightedIndex(prevIndex =>
          prevIndex <= 0 ? options.length - 1 : prevIndex - 1,
        )
        break
      case 'Enter':
        handleSelect(options[highlightedIndex])
    }
  }

  return (
    <div
      tabIndex={0}
      className={cn(
        'p flex items-center rounded-md border border-black px-2 py-1 focus-within:border-2',
        disabled && 'cursor-not-allowed border-gray-300 text-gray-400',
      )}
      onClick={toggle}
      onBlur={close}
      onKeyDown={handleKeyDown}
      role='combobox'
      aria-disabled={disabled}
      ref={wrapperRef}
    >
      <div className='flex gap-2'>
        <div>{displayValue(value) || placeholder}</div>
        <span className={cn(disabled ? 'text-gray-400' : 'text-gray-950')}>
          <svg
            fill='currentColor'
            width='16px'
            height='16px'
            viewBox='-96 0 512 512'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path d='M41 288h238c21.4 0 32.1 25.9 17 41L177 448c-9.4 9.4-24.6 9.4-33.9 0L24 329c-15.1-15.1-4.4-41 17-41z' />
          </svg>
        </span>
      </div>
      {isOpen &&
        !disabled &&
        createPortal(
          <ul
            className='fixed rounded border bg-white shadow'
            role='listbox'
            style={selectStyles}
          >
            {options.map((option, index) => (
              <li
                key={option.value}
                role='option'
                onMouseDown={e => {
                  e.stopPropagation()
                  handleSelect(option)
                }}
                aria-selected={option.value === value}
                aria-disabled={option.disabled}
                className={cn(
                  'cursor-pointer px-2 py-1 hover:bg-gray-400',
                  option.value === value && 'bg-gray-300',
                  option.disabled && 'cursor-not-allowed text-gray-400',
                  highlightedIndex === index && 'bg-gray-400',
                )}
              >
                {option.label}
              </li>
            ))}
          </ul>,
          document.body,
        )}
    </div>
  )
}
