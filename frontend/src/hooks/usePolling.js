import { useEffect, useRef } from 'react'

export default function usePolling(callback, intervalMs, enabled = true) {
  const callbackRef = useRef(callback)
  useEffect(() => { callbackRef.current = callback }, [callback])
  useEffect(() => {
    if (!enabled || intervalMs <= 0) return undefined
    const interval = window.setInterval(() => {
      if (!document.hidden) callbackRef.current()
    }, intervalMs)
    return () => window.clearInterval(interval)
  }, [intervalMs, enabled])
}
