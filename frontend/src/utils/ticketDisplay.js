import { Check } from 'lucide-react'
import { CATEGORY, PRIORITY, SENTIMENT, TICKET_STATUS } from './constants.js'

export const PRIORITY_STYLES = Object.freeze({
  [PRIORITY.CRITICAL]: { label: PRIORITY.CRITICAL, className: 'bg-red-100 text-red-700' },
  [PRIORITY.HIGH]: { label: PRIORITY.HIGH, className: 'bg-orange-100 text-orange-700' },
  [PRIORITY.MEDIUM]: { label: PRIORITY.MEDIUM, className: 'bg-blue-100 text-blue-700' },
  [PRIORITY.LOW]: { label: PRIORITY.LOW, className: 'bg-green-100 text-green-700' },
})

export const CATEGORY_LABELS = Object.freeze({
  [CATEGORY.TECHNICAL]: 'Technical', [CATEGORY.BILLING]: 'Billing', [CATEGORY.FRONTEND]: 'Frontend',
  [CATEGORY.DEVOPS]: 'DevOps', [CATEGORY.GENERAL]: 'General',
})

export const SENTIMENT_DISPLAY = Object.freeze({
  [SENTIMENT.FRUSTRATED]: { emoji: '😠', label: 'Frustrated' },
  [SENTIMENT.NEUTRAL]: { emoji: '😐', label: 'Neutral' },
  [SENTIMENT.POSITIVE]: { emoji: '🙂', label: 'Positive' },
})

export const STATUS_COLUMNS = Object.freeze([
  { status: TICKET_STATUS.TO_DO, label: 'TO DO', pillClassName: 'bg-gray-100 text-gray-700' },
  { status: TICKET_STATUS.IN_PROGRESS, label: 'IN PROGRESS', pillClassName: 'bg-yellow-100 text-yellow-800' },
  { status: TICKET_STATUS.RESOLVED, label: 'RESOLVED', pillClassName: 'bg-green-100 text-green-800', icon: Check },
])
