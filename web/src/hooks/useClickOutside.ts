import { useEffect } from 'react'

export const useClickOutside = <TElement extends HTMLElement>(
  ref: React.RefObject<TElement>,
  callback: () => void,
) => {
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        callback()
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, callback])
}
