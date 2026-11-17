import { useOutletContext } from 'react-router-dom'
import { LayoutDashboard } from 'lucide-react'
import EmptyState from '@/components/common/EmptyState.jsx'

export default function DashboardPage() {
  const { search } = useOutletContext()
  return <div className="space-y-6"><div><p className="text-sm font-medium text-brand-600">Workspace</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">Dashboard</h1>{search && <p className="mt-1 text-sm text-gray-500">Search: {search}</p>}</div><EmptyState icon={LayoutDashboard} title="Your Kanban board is coming next" message="Your team’s ticket workflow will appear here in the next step." /></div>
}
