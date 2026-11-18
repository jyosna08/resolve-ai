import { useEffect, useRef, useState } from 'react'
import { createTicket } from '@/api/ticketApi.js'
import Button from '@/components/common/Button.jsx'
import ErrorBanner from '@/components/common/ErrorBanner.jsx'
import FormField from '@/components/common/FormField.jsx'
import Modal from '@/components/common/Modal.jsx'
import { getErrorMessage } from '@/utils/errors.js'
import useSubmitGuard from '@/hooks/useSubmitGuard.js'
import { validateTicketForm } from '@/utils/validators.js'

/** Ticket submission dialog that remains locked while AI triage is running. */
export default function SubmitIssueModal({ isOpen, onClose, onCreated }) {
  const [values, setValues] = useState({ title: '', description: '' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const { isSubmitting, runOnce } = useSubmitGuard()
  const titleRef = useRef(null)
  const descriptionRef = useRef(null)

  useEffect(() => { if (isOpen) { setErrors({}); setApiError('') } }, [isOpen])

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateTicketForm(values)
    setErrors(nextErrors); setApiError('')
    if (Object.keys(nextErrors).length) {
      (nextErrors.title ? titleRef : descriptionRef).current?.focus()
      return
    }
    await runOnce(async () => {
      try {
        const ticket = await createTicket({ title: values.title.trim(), description: values.description.trim() })
        onCreated?.(ticket)
        setValues({ title: '', description: '' }); setErrors({})
        onClose?.()
      } catch (error) {
        setApiError(getErrorMessage(error, 'Could not submit your issue. Please try again.'))
      }
    })
  }

  return <Modal isOpen={isOpen} onClose={onClose} title="Submit an issue" closeDisabled={isSubmitting} size="md">
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {apiError && <ErrorBanner message={apiError} onDismiss={() => setApiError('')} />}
      <FormField id="issue-title" label="Title" error={errors.title} hint={`${values.title.length} / 200 characters`}><input ref={titleRef} value={values.title} maxLength={200} disabled={isSubmitting} onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))} /></FormField>
      <FormField id="issue-description" label="Description" error={errors.description} hint={`${values.description.length} / 2000 characters`}><textarea ref={descriptionRef} value={values.description} maxLength={2000} rows={6} disabled={isSubmitting} onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))} className="resize-y" /></FormField>
      <Button type="submit" fullWidth loading={isSubmitting}>{isSubmitting ? 'Analyzing with AI…' : 'Submit Issue'}</Button>
    </form>
  </Modal>
}
