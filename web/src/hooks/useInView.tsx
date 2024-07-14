import { useEffect, useMemo, useRef } from 'react'

export const useInView = <TElement extends HTMLElement>(
  rootRef: React.RefObject<TElement>,
  onLoadMore: () => void,
  observe?: boolean,
) => {
  const intersectRef = useRef<HTMLDivElement>(null)

  const watchElement = useMemo(
    () => (
      <div
        aria-label='scroll reference'
        className='p-1'
        ref={intersectRef}
      ></div>
    ),
    [],
  )

  useEffect(() => {
    if (!rootRef?.current || !intersectRef?.current || !observe) {
      return
    }

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          if (observe) {
            onLoadMore()
          }
        }
      },
      {
        root: rootRef.current,
        threshold: 0.3,
      },
    )

    const element = intersectRef.current
    observer.observe(element)

    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (element) {
        observer.unobserve(element)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootRef, observe])

  return watchElement
}
