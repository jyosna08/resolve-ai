import { useEffect, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useAlerts from '@/hooks/useAlerts.js'
import AlertList from './AlertList.jsx'

/** Active-alert bell and accessible dropdown for AGENT and ADMIN roles. */
export default function NotificationBell() {
  const { alerts, count, isLoading, error, refresh, acknowledge } = useAlerts()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)
  const buttonRef = useRef(null)
  const navigate = useNavigate()
  useEffect(() => {
    if (!isOpen) return undefined
    function handlePointerDown(event) { if (!containerRef.current?.contains(event.target)) setIsOpen(false) }
    function handleKeyDown(event) {
      if (event.key === 'Escape') { setIsOpen(false); buttonRef.current?.focus() }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => { document.removeEventListener('pointerdown', handlePointerDown); document.removeEventListener('keydown', handleKeyDown) }
  }, [isOpen])

  function handleViewTicket(ticketId) {
    setIsOpen(false)
    navigate(`/dashboard?ticket=${encodeURIComponent(ticketId)}`)
  }
  const label = `Notifications, ${count} active alerts`
  return <div ref={containerRef} className="static sm:relative">
    <button ref={buttonRef} type="button" aria-label={label} aria-expanded={isOpen} aria-controls="notification-alert-panel" onClick={() => setIsOpen((open) => !open)} className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"><Bell size={20} aria-hidden="true" />{count > 0 && <span aria-hidden="true" className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">{count > 9 ? '9+' : count}</span>}</button>
    {isOpen && <section id="notification-alert-panel" aria-label="Notifications" className="fixed left-0 right-0 top-16 z-40 overflow-hidden rounded-b-xl border border-gray-200 bg-white shadow-xl sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 sm:rounded-xl"><AlertList alerts={alerts} isLoading={isLoading} error={error} onRetry={refresh} onAcknowledge={acknowledge} onViewTicket={handleViewTicket} /></section>}
  </div>
}
