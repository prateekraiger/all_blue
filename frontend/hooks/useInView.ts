import { useState, useEffect, useRef, type RefObject } from "react"

interface UseInViewOptions {
  threshold?: number
  rootMargin?: string
  once?: boolean
}

export function useInView(
  options: UseInViewOptions = {}
): [RefObject<HTMLDivElement | null>, boolean] {
  const [isInView, setIsInView] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const inView = entry.isIntersecting
        setIsInView(inView)

        if (inView && options.once) {
          observer.unobserve(element)
        }
      },
      {
        threshold: options.threshold || 0,
        rootMargin: options.rootMargin || "0px",
      }
    )

    observer.observe(element)

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [options.threshold, options.rootMargin, options.once])

  return [ref, isInView]
}
