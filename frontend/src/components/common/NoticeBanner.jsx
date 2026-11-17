import { X } from 'lucide-react'
import Button from './Button.jsx'

/** Dismissible status banner for successful actions and helpful information. */
export default function NoticeBanner({ message, variant = 'success', onDismiss }) {
  if (!message) return null
  const styles = variant === 'info' ? 'border-blue-200 bg-blue-50 text-blue-800' : 'border-green-200 bg-green-50 text-green-800'
  return <div role="status" className={`flex items-center justify-between gap-3 rounded-lg border p-4 text-sm ${styles}`}><p>{message}</p>{onDismiss && <Button type="button" variant="ghost" size="sm" aria-label="Dismiss notice" onClick={onDismiss}><X size={16} />Dismiss</Button>}</div>
}
