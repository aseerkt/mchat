import { useEffect } from 'react'

export const useClickOutside = <TElement extends HTMLElement>(
  ref: React.RefObject<TElement>,
  callback: () => void,
) => {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        callback()
      }
    }
    document.addEventListener('click', handleClick)
    return () => {
      document.removeEventListener('click', handleClick)
    }
  })
}
