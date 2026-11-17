import { useRef } from 'react'
import { CUSTOMER_STATUS_TABS } from '@/utils/constants.js'

/** Accessible customer ticket status tabs with arrow-key navigation. */
export default function StatusTabs({ value, onChange, counts = {} }) {
  const tabRefs = useRef([])
  function handleKeyDown(event, index) {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? CUSTOMER_STATUS_TABS.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + CUSTOMER_STATUS_TABS.length) % CUSTOMER_STATUS_TABS.length
    const nextTab = CUSTOMER_STATUS_TABS[nextIndex]
    onChange(nextTab.key)
    tabRefs.current[nextIndex]?.focus()
  }
  return <div role="tablist" aria-label="Filter my tickets" className="flex max-w-full gap-1 overflow-x-auto border-b border-gray-200">
    {CUSTOMER_STATUS_TABS.map((tab, index) => <button key={tab.key} ref={(element) => { tabRefs.current[index] = element }} type="button" role="tab" id={`customer-tab-${tab.key}`} aria-selected={value === tab.key} aria-controls="customer-ticket-list" tabIndex={value === tab.key ? 0 : -1} onClick={() => onChange(tab.key)} onKeyDown={(event) => handleKeyDown(event, index)} className={`shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium ${value === tab.key ? 'border-brand-500 text-brand-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
      {tab.label}<span className={`ml-2 rounded-full px-1.5 py-0.5 text-xs ${value === tab.key ? 'bg-brand-50 text-brand-700' : 'bg-gray-100 text-gray-600'}`}>{counts[tab.key] ?? 0}</span>
    </button>)}
  </div>
}
