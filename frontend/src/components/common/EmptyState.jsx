/** Friendly centered empty state with optional lucide icon and action. */
export default function EmptyState({ icon: Icon, title, message, action }) {
  return <section className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
    {Icon && <div className="mb-4 rounded-full bg-brand-50 p-3 text-brand-600"><Icon aria-hidden="true" size={24} /></div>}
    <h2 className="text-lg font-semibold text-gray-900">{title}</h2><p className="mt-2 max-w-md text-sm text-gray-500">{message}</p>{action && <div className="mt-5">{action}</div>}
  </section>
}
