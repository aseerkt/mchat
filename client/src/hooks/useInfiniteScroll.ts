import { useEffect, useRef } from 'react'

export const useInfiniteScroll = (
  rootRef: React.RefObject<HTMLDivElement>,
  observe?: boolean,
) => {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const trackIntersection = () => {
      if (!rootRef?.current || !scrollRef?.current || !observe) {
        return
      }

      const observer = new IntersectionObserver(
        (entries, observer) => {
          console.log(entries, observer)
        },
        {
          root: rootRef.current,
          threshold: 0.5,
        },
      )

      observer.observe(scrollRef.current)
    }

    trackIntersection()
  }, [rootRef, observe])

  return { scrollRef }
}
