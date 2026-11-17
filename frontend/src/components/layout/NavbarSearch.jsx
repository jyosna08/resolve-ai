import { Search } from 'lucide-react'

/** Search field shown to operational roles in the workspace navbar. */
export default function NavbarSearch({ value, onChange }) {
  return <label className="relative block w-full max-w-md"><span className="sr-only">Search tickets</span><Search aria-hidden="true" size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder="Search tickets..." className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" /></label>
}
