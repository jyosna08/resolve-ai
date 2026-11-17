import { CATEGORY } from '@/utils/constants.js'
import { CATEGORY_LABELS } from '@/utils/ticketDisplay.js'

/** Human-readable ticket category chip. */
export default function CategoryTag({ category, className = '' }) {
  return <span className={`inline-flex rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 ${className}`}>{CATEGORY_LABELS[category] || CATEGORY_LABELS[CATEGORY.GENERAL]}</span>
}
