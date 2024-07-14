import { useCallback, useState } from 'react'

export const useDisclosure = (initialValue = false) => {
  const [isOpen, setIsOpen] = useState(initialValue)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen(op => !op), [])

  return { isOpen, open, close, toggle }
}
