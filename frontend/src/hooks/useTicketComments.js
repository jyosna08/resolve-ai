import { useCallback, useEffect, useRef, useState } from 'react'
import { getTicketComments } from '@/api/ticketApi.js'
import { getErrorMessage, isRequestCanceled } from '@/utils/errors.js'

export default function useTicketComments(ticketId) {
  const [comments, setComments] = useState([])
  const [isLoading, setIsLoading] = useState(Boolean(ticketId))
  const [error, setError] = useState('')
  const [version, setVersion] = useState(0)
  const sequence = useRef(0)
  useEffect(() => {
    if (ticketId == null) { setComments([]); setIsLoading(false); setError(''); return undefined }
    const controller = new AbortController()
    const currentSequence = ++sequence.current
    setIsLoading(true); setError('')
    getTicketComments(ticketId, { signal: controller.signal }).then((data) => {
      if (!controller.signal.aborted && currentSequence === sequence.current) setComments(Array.isArray(data) ? data : [])
    }).catch((requestError) => {
      if (!controller.signal.aborted && !isRequestCanceled(requestError) && currentSequence === sequence.current) setError(getErrorMessage(requestError, 'Could not load comments.'))
    }).finally(() => {
      if (!controller.signal.aborted && currentSequence === sequence.current) setIsLoading(false)
    })
    return () => controller.abort()
  }, [ticketId, version])
  const reload = useCallback(() => setVersion((current) => current + 1), [])
  return { comments, isLoading, error, reload }
}
