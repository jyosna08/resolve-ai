import { useOutletContext } from 'react-router-dom'
import { Inbox } from 'lucide-react'
import EmptyState from '@/components/common/EmptyState.jsx'

export default function MyTicketsPage() {
  const { search } = useOutletContext()
  return <div className="space-y-6"><div><p className="text-sm font-medium text-brand-600">Customer portal</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">My tickets</h1>{search && <p className="mt-1 text-sm text-gray-500">Search: {search}</p>}</div><EmptyState icon={Inbox} title="Your ticket portal is coming next" message="Tickets you submit and their latest status will appear here in the next step." /></div>
}
