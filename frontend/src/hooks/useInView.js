import { useEffect, useRef, useState } from 'react'

export default function useInView(options = { threshold: 0.2, rootMargin: '0px' }) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    if (!ref.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.unobserve(entry.target)
        }
      },
      options
    )

    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [ref, options])

  return [ref, inView]
}
