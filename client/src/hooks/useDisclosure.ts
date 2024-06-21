import { useCallback, useState } from 'react'

export const useDisclosure = (initialValue = false) => {
  const [isOpen, setIsOpen] = useState(initialValue)

  const toggle = useCallback(() => setIsOpen(op => !op), [])

  return { isOpen, toggle }
}
