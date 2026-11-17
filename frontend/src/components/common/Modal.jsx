import { useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'
import Button from './Button.jsx'

const sizes = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-2xl' }

/** Centered accessible modal with focus management and scroll locking. */
export default function Modal({ isOpen, onClose, title, children, closeDisabled = false, size = 'md' }) {
  const titleId = useId()
  const dialogRef = useRef(null)
  const previousFocus = useRef(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  useEffect(() => {
    if (!isOpen) return undefined
    previousFocus.current = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusable = dialogRef.current?.querySelector('button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])')
    ;(focusable || dialogRef.current)?.focus()
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        if (!closeDisabled) onCloseRef.current?.()
        return
      }
      if (event.key !== 'Tab') return
      const items = dialogRef.current?.querySelectorAll('button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])')
      if (!items?.length) { event.preventDefault(); dialogRef.current?.focus(); return }
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      if (previousFocus.current instanceof HTMLElement) previousFocus.current.focus()
    }
  }, [isOpen, closeDisabled])
  if (!isOpen) return null
  const handleBackdropClick = (event) => { if (!closeDisabled && event.target === event.currentTarget) onClose?.() }
  return <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto p-4" data-testid="modal-backdrop" onClick={handleBackdropClick}>
    <div aria-hidden="true" className="fixed inset-0 bg-gray-950/50" onClick={handleBackdropClick} />
    <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} className={`relative z-10 max-h-[calc(100vh-2rem)] w-full overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl ${sizes[size] || sizes.md}`}>
      <header className="flex items-center justify-between border-b border-gray-100 px-5 py-4"><h2 id={titleId} className="text-lg font-semibold text-gray-900">{title}</h2><Button type="button" variant="ghost" size="sm" aria-label="Close dialog" disabled={closeDisabled} onClick={onClose}><X size={18} /></Button></header>
      <div className="p-5">{children}</div>
    </section>
  </div>
}
