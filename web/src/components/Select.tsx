import { useDisclosure } from '@/hooks/useDisclosure'
import { useKeyboardListNavigation } from '@/hooks/useKeyboardListNavigation'
import { cn } from '@/utils/style'
import { useRef } from 'react'
import { Menu, MenuItem } from './Menu'

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

  const { isOpen, toggle, close } = useDisclosure()
  const anchorRef = useRef<HTMLDivElement>(null)

  const { handleKeyDown, highlightedIndex } = useKeyboardListNavigation({
    listLength: options.length,
    onEnter(highlightedIndex) {
      handleSelect(options[highlightedIndex])
    },
  })

  const handleSelect = (option: (typeof options)[0]) => {
    if (!option.disabled || option.value === value) {
      onSelect(option.value)
      close()
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
      ref={anchorRef}
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
      {isOpen && !disabled && (
        <Menu anchorRef={anchorRef} anchorFullWidth role='listbox'>
          {options.map((option, index) => (
            <MenuItem
              key={option.value}
              role='option'
              onSelect={() => {
                handleSelect(option)
              }}
              isSelected={option.value === value}
              isDisabled={option.disabled}
              isHighlighted={highlightedIndex === index}
            >
              {option.label}
            </MenuItem>
          ))}
        </Menu>
      )}
    </div>
  )
}
