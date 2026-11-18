import { useCallback, useEffect, useRef, useState } from 'react'

/** Prevents overlapping submissions, including repeated events in one render tick. */
export default function useSubmitGuard() {
  const submitting = useRef(false)
  const mounted = useRef(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  const runOnce = useCallback(async (asyncFn) => {
    if (submitting.current) return undefined
    submitting.current = true
    if (mounted.current) setIsSubmitting(true)
    try {
      return await asyncFn()
    } finally {
      submitting.current = false
      if (mounted.current) setIsSubmitting(false)
    }
  }, [])

  return { isSubmitting, runOnce }
}
