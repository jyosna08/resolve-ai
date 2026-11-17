import { useCallback, useEffect, useRef, useState } from 'react'
import { getTickets } from '@/api/ticketApi.js'
import useDebounce from './useDebounce.js'
import { SEARCH_DEBOUNCE_MS } from '@/utils/constants.js'
import { getErrorMessage, isRequestCanceled } from '@/utils/errors.js'

export default function useTickets(search = '') {
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS)
  const [tickets, setTickets] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [requestVersion, setRequestVersion] = useState(0)
  const hasLoaded = useRef(false)
  const sequence = useRef(0)

  useEffect(() => {
    const controller = new AbortController()
    const currentSequence = ++sequence.current
    if (!hasLoaded.current) setIsLoading(true)
    getTickets(debouncedSearch ? { search: debouncedSearch } : {}, { signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted || currentSequence !== sequence.current) return
        setTickets(Array.isArray(data) ? data : [])
        hasLoaded.current = true
        setError('')
      })
      .catch((requestError) => {
        if (controller.signal.aborted || isRequestCanceled(requestError) || currentSequence !== sequence.current) return
        setError(getErrorMessage(requestError, 'Could not load tickets.'))
      })
      .finally(() => {
        if (controller.signal.aborted || currentSequence !== sequence.current) return
        setIsLoading(false)
      })
    return () => controller.abort()
  }, [debouncedSearch, requestVersion])

  const refresh = useCallback(() => setRequestVersion((version) => version + 1), [])
  const replaceTicket = useCallback((updatedTicket) => {
    setTickets((current) => current.map((ticket) => ticket.id === updatedTicket.id ? updatedTicket : ticket))
  }, [])
  return { tickets, isLoading, error, refresh, replaceTicket }
}
