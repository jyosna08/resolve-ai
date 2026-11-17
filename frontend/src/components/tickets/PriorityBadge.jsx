import { PRIORITY } from '@/utils/constants.js'
import { PRIORITY_STYLES } from '@/utils/ticketDisplay.js'

/** Color-coded ticket priority label. */
export default function PriorityBadge({ priority, className = '' }) {
  const config = PRIORITY_STYLES[priority] || PRIORITY_STYLES[PRIORITY.MEDIUM]
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${config.className} ${className}`}>{config.label}</span>
}
