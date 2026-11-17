import { TICKET_STATUS } from '@/utils/constants.js'
import { CUSTOMER_STATUS_LABELS } from '@/utils/ticketDisplay.js'

/** Customer-friendly status label that avoids internal workflow wording. */
export default function CustomerStatusBadge({ status }) {
  const styles = { [TICKET_STATUS.TO_DO]: 'bg-blue-50 text-blue-700', [TICKET_STATUS.IN_PROGRESS]: 'bg-amber-50 text-amber-800', [TICKET_STATUS.RESOLVED]: 'bg-green-50 text-green-700' }
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status] || styles[TICKET_STATUS.TO_DO]}`}>{CUSTOMER_STATUS_LABELS[status] || CUSTOMER_STATUS_LABELS[TICKET_STATUS.TO_DO]}</span>
}
