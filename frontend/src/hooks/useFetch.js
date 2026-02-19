/** Purpose: reusable async data hook with loading, errors, retry, and abort support. */
import { useCallback, useEffect, useRef, useState } from 'react'

export default function useFetch(fetcher, deps = [], options = {}) {
  const [data, setData] = useState(options.initialData ?? null)
  const [loading, setLoading] = useState(Boolean(options.immediate ?? true))
  const [error, setError] = useState(null)
  const controllerRef = useRef(null)

  const execute = useCallback(async () => {
    if (controllerRef.current) {
      controllerRef.current.abort()
    }

    const controller = new AbortController()
    controllerRef.current = controller

    setLoading(true)
    setError(null)

    try {
      const result = await fetcher(controller.signal)
      setData(result)
      return result
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err)
      }
      return null
    } finally {
      setLoading(false)
    }
  }, deps)

  useEffect(() => {
    if (options.immediate === false) return undefined
    execute()

    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort()
      }
    }
  }, [execute, options.immediate])

  return {
    data,
    loading,
    error,
    retry: execute,
  }
}
