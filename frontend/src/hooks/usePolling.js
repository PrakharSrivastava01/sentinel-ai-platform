import { useState, useEffect, useRef, useCallback } from 'react'

export function usePolling(fetcher, interval = 5000) {
  const [data, setData]       = useState(null)
  const [error, setError]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)
  const timerRef = useRef(null)

  const fetch = useCallback(async () => {
    try {
      const result = await fetcher()
      setData(result)
      setError(null)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [fetcher])

  useEffect(() => {
    fetch()
    timerRef.current = setInterval(fetch, interval)
    return () => clearInterval(timerRef.current)
  }, [fetch, interval])

  return { data, error, loading, lastUpdated, refetch: fetch }
}

export function useMetricsHistory(fetcher, maxLen = 30, interval = 5000) {
  const [history, setHistory] = useState([])
  const [error, setError]     = useState(null)
  const timerRef = useRef(null)

  const fetch = useCallback(async () => {
    try {
      const result = await fetcher()
      setHistory(prev => {
        const next = [...prev, { ...result, ts: Date.now() }]
        return next.slice(-maxLen)
      })
      setError(null)
    } catch (err) {
      setError(err.message)
    }
  }, [fetcher, maxLen])

  useEffect(() => {
    fetch()
    timerRef.current = setInterval(fetch, interval)
    return () => clearInterval(timerRef.current)
  }, [fetch, interval])

  return { history, error }
}
