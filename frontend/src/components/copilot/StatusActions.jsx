import { useState } from 'react'
import { TICKET_STATUS } from '@/utils/constants.js'
import { updateTicketStatus } from '@/api/ticketApi.js'
import Button from '@/components/common/Button.jsx'
import ErrorBanner from '@/components/common/ErrorBanner.jsx'
import { getErrorMessage } from '@/utils/errors.js'

/** Allows the agent to move a ticket between its active workflow states. */
export default function StatusActions({ ticket, onTicketUpdated }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  let nextStatus
  let label
  if (ticket.status === TICKET_STATUS.TO_DO) { nextStatus = TICKET_STATUS.IN_PROGRESS; label = 'Start Progress' }
  else if (ticket.status === TICKET_STATUS.IN_PROGRESS) { nextStatus = TICKET_STATUS.TO_DO; label = 'Move back to To Do' }
  if (!nextStatus) return null
  async function handleMove() {
    setLoading(true); setError('')
    try {
      const updated = await updateTicketStatus(ticket.id, nextStatus)
      onTicketUpdated?.(updated)
    }
    catch (requestError) { setError(getErrorMessage(requestError, 'Could not update ticket status.')) }
    finally { setLoading(false) }
  }
  return <div className="space-y-2">{error && <ErrorBanner message={error} onDismiss={() => setError('')} />}<Button type="button" variant="secondary" loading={loading} onClick={handleMove}>{label}</Button></div>
}
