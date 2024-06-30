import { RefObject, useEffect } from 'react'

export const useAutoFocus = <TElement extends HTMLElement>(
  ref: RefObject<TElement>,
  deps?: React.DependencyList,
) => {
  useEffect(() => {
    ref.current?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
