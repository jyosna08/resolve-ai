import { useCallback, useEffect, useRef, useState } from 'react'
import { acknowledgeAlert, getAlerts } from '@/api/notificationApi.js'
import { REFRESH_INTERVAL_MS } from '@/utils/constants.js'
import { toEpochMs } from '@/utils/dateTime.js'
import { getErrorMessage, isRequestCanceled } from '@/utils/errors.js'
import usePolling from './usePolling.js'

export default function useAlerts() {
  const [alerts, setAlerts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [requestVersion, setRequestVersion] = useState(0)
  const hasLoaded = useRef(false)
  const sequence = useRef(0)

  useEffect(() => {
    const controller = new AbortController()
    const currentSequence = ++sequence.current
    if (!hasLoaded.current) setIsLoading(true)
    getAlerts({ signal: controller.signal }).then((data) => {
      if (controller.signal.aborted || currentSequence !== sequence.current) return
      setAlerts(Array.isArray(data) ? data.filter((alert) => !alert.acknowledged) : [])
      hasLoaded.current = true
      setError('')
    }).catch((requestError) => {
      if (controller.signal.aborted || isRequestCanceled(requestError) || currentSequence !== sequence.current) return
      setError(getErrorMessage(requestError, 'Could not load notifications.'))
    }).finally(() => {
      if (!controller.signal.aborted && currentSequence === sequence.current) setIsLoading(false)
    })
    return () => controller.abort()
  }, [requestVersion])

  const refresh = useCallback(() => setRequestVersion((version) => version + 1), [])
  usePolling(refresh, REFRESH_INTERVAL_MS)

  const acknowledge = useCallback(async (id) => {
    const removed = alerts.find((alert) => alert.id === id)
    if (!removed) return
    setError('')
    setAlerts((current) => current.filter((alert) => alert.id !== id))
    try { await acknowledgeAlert(id) }
    catch (requestError) {
      setAlerts((current) => current.some((alert) => alert.id === id) ? current : [...current, removed].sort((left, right) => (toEpochMs(right.createdAt) ?? 0) - (toEpochMs(left.createdAt) ?? 0)))
      setError(getErrorMessage(requestError, 'Could not acknowledge this alert.'))
    }
  }, [alerts])

  return { alerts, count: alerts.length, isLoading, error, refresh, acknowledge }
}
