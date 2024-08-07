import { useClickOutside } from '@/hooks/useClickOutside'
import { useKeyboardListNavigation } from '@/hooks/useKeyboardListNavigation'
import { debounce } from '@/utils/lodash'
import { cn } from '@/utils/style'
import { Children, cloneElement, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

type MenuVerticalPosition = 'top' | 'center' | 'bottom'
type MenuHorizontalPosition = 'left' | 'center' | 'right'

type MenuOrigin = {
  vertical: MenuVerticalPosition
  horizontal: MenuHorizontalPosition
}

// https://mui.com/material-ui/react-popover/#anchor-playground

const getMenuStyles = <T extends HTMLElement>(
  anchorRef: React.RefObject<T>,
  anchorOrigin: MenuOrigin = { vertical: 'bottom', horizontal: 'left' },
  transformOrigin: MenuOrigin = { vertical: 'bottom', horizontal: 'left' },
  anchorFullWidth = false,
) => {
  let menuStyles: React.CSSProperties = {}

  if (anchorRef.current) {
    const anchorElRect = anchorRef.current.getBoundingClientRect()

    // Compute the top and left positions based on the anchor position
    let top: number
    let left: number

    switch (anchorOrigin.vertical) {
      case 'top':
        top = anchorElRect.top
        break
      case 'center':
        top = anchorElRect.top + anchorElRect.height / 2
        break
      case 'bottom':
        top = anchorElRect.bottom
        break
    }

    switch (anchorOrigin.horizontal) {
      case 'left':
        left = anchorElRect.left
        break
      case 'center':
        left = anchorElRect.left + anchorElRect.width / 2
        break
      case 'right':
        left = anchorElRect.right
        break
    }

    // Compute the transform styles based on the transform position
    let transform = ''

    switch (transformOrigin.vertical) {
      case 'top':
        transform += 'translateY(0%) '
        break
      case 'center':
        transform += 'translateY(-50%) '
        break
      case 'bottom':
        transform += 'translateY(-100%) '
        break
    }

    switch (transformOrigin.horizontal) {
      case 'left':
        transform += 'translateX(0%)'
        break
      case 'center':
        transform += 'translateX(-50%)'
        break
      case 'right':
        transform += 'translateX(-100%)'
        break
    }

    menuStyles = {
      position: 'absolute',
      top,
      left,
      transform,
      width: anchorFullWidth ? anchorElRect.width : undefined,
    }
  }

  return menuStyles
}

const preventDefault = (e: Event) => {
  e.preventDefault()
}

const disableScroll = () => {
  document.addEventListener('wheel', preventDefault, { passive: false })
  document.addEventListener('touchmove', preventDefault, { passive: false })
}

const enableScroll = () => {
  document.removeEventListener('wheel', preventDefault)
  document.removeEventListener('touchmove', preventDefault)
}

export const Menu = <T extends HTMLElement>({
  children,
  className,
  style,
  anchorRef,
  anchorOrigin = { vertical: 'bottom', horizontal: 'left' },
  transformOrigin = { vertical: 'top', horizontal: 'left' },
  anchorFullWidth = false,
  onArrowUp,
  onArrowDown,
  onEscape,
  onEnter,
  onTab,

  ...props
}: React.HTMLAttributes<HTMLUListElement> &
  Omit<Parameters<typeof useKeyboardListNavigation>[0], 'listLength'> & {
    anchorRef: React.RefObject<T>
    anchorOrigin?: MenuOrigin
    transformOrigin?: MenuOrigin
    anchorFullWidth?: boolean
    onBlur?: () => void
  }) => {
  const menuRef = useRef<HTMLUListElement>(null)
  const [menuStyles, setMenuStyles] = useState<React.CSSProperties>(
    getMenuStyles(anchorRef, anchorOrigin, transformOrigin, anchorFullWidth),
  )
  const { highlightedIndex, handleKeyDown } = useKeyboardListNavigation({
    listLength: Children.count(children),
    onArrowUp,
    onArrowDown,
    onEscape,
    onEnter,
    onTab,
  })

  useClickOutside(menuRef, props.onBlur)

  useEffect(() => {
    if (!anchorRef.current) return

    disableScroll()
    const updateMenuStyles = debounce(() => {
      setMenuStyles(
        getMenuStyles(
          anchorRef,
          anchorOrigin,
          transformOrigin,
          anchorFullWidth,
        ),
      )
    })

    window.addEventListener('resize', updateMenuStyles)
    const anchor = anchorRef.current
    anchor.addEventListener('keydown', handleKeyDown)

    return () => {
      enableScroll()
      window.removeEventListener('resize', updateMenuStyles)
      anchor?.removeEventListener('keydown', handleKeyDown)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchorRef])

  return createPortal(
    <ul
      ref={menuRef}
      role='listbox'
      {...props}
      style={{ ...menuStyles, ...style }}
      className={cn('absolute z-30 rounded border bg-white shadow', className)}
    >
      {Children.map(children, (child, index) =>
        cloneElement(child as React.ReactElement<MenuItemProps>, {
          isHighlighted: index === highlightedIndex,
        }),
      )}
    </ul>,
    document.body,
  )
}

type MenuItemProps = Omit<
  React.HTMLAttributes<HTMLLIElement>,
  'onMouseDown'
> & {
  onSelect: () => void
  isSelected?: boolean
  isDisabled?: boolean
  isHighlighted?: boolean
}

export const MenuItem = ({
  children,
  className,
  onSelect,
  isSelected = false,
  isDisabled = false,
  isHighlighted,
  ...props
}: MenuItemProps) => {
  return (
    <li
      role='option'
      aria-selected={isSelected}
      aria-disabled={isDisabled}
      tabIndex={-1} // keyboard arrow up/down instead of tab
      {...props}
      onMouseDown={e => {
        e.stopPropagation()
        if (!isDisabled) {
          onSelect()
        }
      }}
      className={cn(
        'inline-flex min-h-10 w-full cursor-pointer items-center border-b px-2 py-1 text-sm last:border-none hover:bg-gray-300',
        isSelected && 'bg-gray-200',
        isDisabled && 'cursor-not-allowed text-gray-400',
        isHighlighted && 'bg-gray-400',
        className,
      )}
    >
      {children}
    </li>
  )
}
