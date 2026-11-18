import { useState } from 'react'
import { REPLY_MAX_LENGTH, TICKET_STATUS } from '@/utils/constants.js'
import { verifyReply } from '@/api/ticketApi.js'
import Button from '@/components/common/Button.jsx'
import ErrorBanner from '@/components/common/ErrorBanner.jsx'
import FormField from '@/components/common/FormField.jsx'
import { getErrorMessage } from '@/utils/errors.js'
import { inputClassName } from '@/components/common/FormField.jsx'
import { validateReply } from '@/utils/validators.js'
import useSubmitGuard from '@/hooks/useSubmitGuard.js'

/** Editable draft that verifies the human-reviewed reply. */
export default function DraftReplyEditor({ ticket, onTicketUpdated, onRefresh, reloadComments }) {
  const [draft, setDraft] = useState(ticket.aiDraftReply || '')
  const [validationError, setValidationError] = useState('')
  const [apiError, setApiError] = useState('')
  const { isSubmitting, runOnce } = useSubmitGuard()
  if (ticket.status === TICKET_STATUS.RESOLVED) return null

  async function handleSubmit(event) {
    event.preventDefault()
    const error = validateReply(draft)
    setValidationError(error); setApiError('')
    if (error) return
    await runOnce(async () => {
      try {
        const updated = await verifyReply(ticket.id, draft.trim())
        onTicketUpdated?.(updated)
        reloadComments?.()
      } catch (requestError) {
        setApiError(getErrorMessage(requestError, 'Could not verify and send this reply.'))
        if ([403, 409].includes(requestError?.response?.status)) onRefresh?.()
      }
    })
  }

  return <form onSubmit={handleSubmit} noValidate className="space-y-3">{apiError && <ErrorBanner message={apiError} onDismiss={() => setApiError('')} />}
    <FormField id="draft-reply" label="Editable Draft Response" error={validationError} hint={`${draft.length} / ${REPLY_MAX_LENGTH} characters`}><textarea value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={REPLY_MAX_LENGTH + 100} rows={5} className={`${inputClassName} resize-y`} /></FormField>
    <Button type="submit" variant="success" fullWidth loading={isSubmitting}>Verify &amp; Send Reply</Button>
  </form>
}
