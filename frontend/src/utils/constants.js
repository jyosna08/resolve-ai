export const ROLES = Object.freeze({ CUSTOMER: 'CUSTOMER', AGENT: 'AGENT', ADMIN: 'ADMIN' })
export const DEPARTMENTS = Object.freeze({ TECHNICAL: 'TECHNICAL', BILLING: 'BILLING', FRONTEND: 'FRONTEND', DEVOPS: 'DEVOPS', GENERAL: 'GENERAL' })
export const TICKET_STATUS = Object.freeze({ TO_DO: 'TO_DO', IN_PROGRESS: 'IN_PROGRESS', RESOLVED: 'RESOLVED' })
export const PRIORITY = Object.freeze({ CRITICAL: 'CRITICAL', HIGH: 'HIGH', MEDIUM: 'MEDIUM', LOW: 'LOW' })
export const CATEGORY = Object.freeze({ ...DEPARTMENTS })
export const SENTIMENT = Object.freeze({ FRUSTRATED: 'FRUSTRATED', NEUTRAL: 'NEUTRAL', POSITIVE: 'POSITIVE' })
export const SESSION_STORAGE_KEY = 'resolveai.session'
export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 100
export const NAME_MAX_LENGTH = 100
export const EMAIL_MAX_LENGTH = 150
export const REFRESH_INTERVAL_MS = 30000
export const SEARCH_DEBOUNCE_MS = 400
export const REPLY_MIN_LENGTH = 5
export const REPLY_MAX_LENGTH = 2000
export const SLA_WARNING_MINUTES = 120
export const MAX_RESOLVED_VISIBLE = 20
export const PRIORITY_RANK = Object.freeze({ [PRIORITY.CRITICAL]: 0, [PRIORITY.HIGH]: 1, [PRIORITY.MEDIUM]: 2, [PRIORITY.LOW]: 3 })
export const ALERT_TYPE = Object.freeze({ CRITICAL_ESCALATION: 'CRITICAL_ESCALATION', SLA_BREACH: 'SLA_BREACH' })
export const TICKET_TITLE_MIN = 5
export const TICKET_TITLE_MAX = 200
export const TICKET_DESCRIPTION_MIN = 10
export const TICKET_DESCRIPTION_MAX = 2000
export const CUSTOMER_STATUS_TABS = Object.freeze([
  { key: 'ALL', label: 'All', status: null },
  { key: TICKET_STATUS.TO_DO, label: 'To Do', status: TICKET_STATUS.TO_DO },
  { key: TICKET_STATUS.IN_PROGRESS, label: 'In Progress', status: TICKET_STATUS.IN_PROGRESS },
  { key: TICKET_STATUS.RESOLVED, label: 'Resolved', status: TICKET_STATUS.RESOLVED },
])
