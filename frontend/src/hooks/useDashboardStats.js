import { useCallback, useEffect, useRef, useState } from 'react'
import { getDashboardStats } from '@/api/ticketApi.js'
import { getErrorMessage, isRequestCanceled } from '@/utils/errors.js'

export default function useDashboardStats() {
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [requestVersion, setRequestVersion] = useState(0)
  const hasLoaded = useRef(false)
  const sequence = useRef(0)
  useEffect(() => {
    const controller = new AbortController()
    const currentSequence = ++sequence.current
    if (!hasLoaded.current) setIsLoading(true)
    getDashboardStats({ signal: controller.signal }).then((data) => {
      if (controller.signal.aborted || currentSequence !== sequence.current) return
      setStats(data); hasLoaded.current = true; setError('')
    }).catch((requestError) => {
      if (controller.signal.aborted || isRequestCanceled(requestError) || currentSequence !== sequence.current) return
      setError(getErrorMessage(requestError, 'Could not load dashboard stats.'))
    }).finally(() => {
      if (!controller.signal.aborted && currentSequence === sequence.current) setIsLoading(false)
    })
    return () => controller.abort()
  }, [requestVersion])
  const refresh = useCallback(() => setRequestVersion((version) => version + 1), [])
  return { stats, isLoading, error, refresh }
}
