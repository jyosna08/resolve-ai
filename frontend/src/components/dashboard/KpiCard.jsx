import Skeleton from '@/components/common/Skeleton.jsx'

const tones = {
  blue: 'bg-brand-50 text-brand-600', red: 'bg-red-100 text-red-600', green: 'bg-green-100 text-green-700', amber: 'bg-amber-100 text-amber-700',
}

/** Single KPI metric card with loading and unavailable-value states. */
export default function KpiCard({ label, value, icon: Icon, tone = 'blue', highlighted = false, isLoading = false }) {
  return <article className={`flex min-h-28 items-center justify-between rounded-xl border p-5 shadow-sm ${highlighted ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'}`}>
    <div><p className="text-sm font-medium text-gray-600">{label}</p>{isLoading ? <Skeleton className="mt-2 h-8 w-16" /> : <p className="mt-1 text-3xl font-bold tracking-tight text-gray-900">{value ?? '—'}</p>}</div>
    <div className={`flex h-12 w-12 items-center justify-center rounded-full ${tones[tone] || tones.blue}`}><Icon size={22} aria-hidden="true" /></div>
  </article>
}
