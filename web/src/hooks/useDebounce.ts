import { useEffect, useRef, useState } from 'react'

export const useDebounce = <TValue>(value: TValue, ms = 300) => {
  const [debouncedValue, setDebouncedValue] = useState<TValue>(value)
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => setDebouncedValue(value), ms)

    return () => {
      clearTimeout(timeoutRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return debouncedValue
}
