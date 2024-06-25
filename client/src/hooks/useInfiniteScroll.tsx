import { useEffect, useRef } from 'react'

export const useInfiniteScroll = (
  rootRef: React.RefObject<HTMLDivElement>,
  onLoadMore: () => void,
  observe?: boolean,
) => {
  const intersectRef = useRef<HTMLDivElement>(null)

  const watchElement = (
    <div aria-label='scroll reference' ref={intersectRef}></div>
  )

  useEffect(() => {
    if (!rootRef?.current || !intersectRef?.current || !observe) {
      return
    }

    function trackIntersection() {
      const observer = new IntersectionObserver(
        entries => {
          console.log(entries)
          if (entries[0].isIntersecting) {
            if (observe) {
              console.log('intersected')
              onLoadMore()
            }
          }
        },
        {
          root: rootRef.current,
          threshold: 0.3,
        },
      )

      observer.observe(intersectRef.current!)
      return observer
    }

    const observer = trackIntersection()
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      observer.unobserve(intersectRef.current!)
    }
  }, [rootRef, observe])

  return watchElement
}
