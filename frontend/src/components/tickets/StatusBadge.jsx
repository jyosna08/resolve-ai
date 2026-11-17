import { TICKET_STATUS } from '@/utils/constants.js'
import { STATUS_COLUMNS } from '@/utils/ticketDisplay.js'

/** Colored status pill based on the shared board status configuration. */
export default function StatusBadge({ status }) {
  const config = STATUS_COLUMNS.find((column) => column.status === status) || STATUS_COLUMNS[0]
  const Icon = status === TICKET_STATUS.RESOLVED ? config.icon : null
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${config.pillClassName}`}>{Icon && <Icon size={13} aria-hidden="true" />}{config.label}</span>
}
