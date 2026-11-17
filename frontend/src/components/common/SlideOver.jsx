import { useEffect, useRef } from 'react'

/** Accessible right-side dialog that restores focus when it closes. */
export default function SlideOver({ isOpen, onClose, title, ariaLabel, children, className = '' }) {
  const panelRef = useRef(null)
  const previousFocus = useRef(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  useEffect(() => {
    if (!isOpen) return undefined
    previousFocus.current = document.activeElement
    panelRef.current?.focus()
    function handleKeyDown(event) {
      if (event.key === 'Escape') { onCloseRef.current?.(); return }
      if (event.key !== 'Tab') return
      const focusable = panelRef.current?.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])')
      if (!focusable?.length) { event.preventDefault(); panelRef.current?.focus(); return }
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      if (previousFocus.current instanceof HTMLElement) previousFocus.current.focus()
    }
  }, [isOpen])
  if (!isOpen) return null
  return <div className="fixed inset-0 z-50" data-testid="slide-over">
    <button type="button" aria-label="Close dialog backdrop" onClick={onClose} className="absolute inset-0 h-full w-full cursor-default bg-gray-950/40 transition-opacity motion-reduce:transition-none" />
    <section ref={panelRef} role="dialog" aria-modal="true" aria-label={ariaLabel || title} tabIndex={-1} className={`absolute inset-y-0 right-0 flex w-full flex-col overflow-y-auto bg-white shadow-2xl motion-safe:animate-slide-in-right motion-reduce:animate-none md:w-[420px] ${className}`}>
      {children}
    </section>
  </div>
}
