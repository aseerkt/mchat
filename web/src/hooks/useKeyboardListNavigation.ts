import { useCallback, useState } from 'react'

export const useKeyboardListNavigation = ({
  listLength,
  onEnter,
  onArrowUp,
  onArrowDown,
  onTab,
  onEscape,
}: {
  listLength: number
  onEnter?: (highlightedIndex: number) => void
  onArrowUp?: () => void
  onArrowDown?: () => void
  onTab?: () => void
  onEscape?: () => void
}) => {
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  const resetHighlightedIndex = useCallback(() => setHighlightedIndex(-1), [])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      e.stopPropagation()

      if (!listLength) return

      switch (e.key) {
        case 'ArrowDown':
          setHighlightedIndex(prevIndex =>
            prevIndex === listLength - 1 ? 0 : prevIndex + 1,
          )
          if (onArrowDown) onArrowDown()
          break
        case 'ArrowUp':
          setHighlightedIndex(prevIndex =>
            prevIndex === 0 ? listLength - 1 : prevIndex - 1,
          )
          if (onArrowUp) onArrowUp()
          break
        case 'Enter':
          if (highlightedIndex >= 0 && onEnter) onEnter(highlightedIndex)
          break
        case 'Tab':
          if (onTab) onTab()
          break
        case 'Escape':
          if (onEscape) onEscape()
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [highlightedIndex],
  )

  return {
    highlightedIndex,
    resetHighlightedIndex,
    handleKeyDown,
  }
}
