import { ROLES } from '@/utils/constants.js'

const labels = { [ROLES.CUSTOMER]: 'Customer', [ROLES.AGENT]: 'Agent', [ROLES.ADMIN]: 'Admin' }

/** Accessible radio group for selecting a registration role. */
export default function RoleSelector({ value, onChange, error, roles = Object.values(ROLES) }) {
  return <fieldset><legend className="mb-2 text-sm font-medium text-gray-700">Account type</legend><div role="radiogroup" aria-label="Account type" className="grid grid-cols-3 rounded-lg border border-gray-200 bg-gray-50 p-1">{roles.map((role) => <button key={role} type="button" role="radio" aria-checked={value === role} onClick={() => onChange(role)} className={`rounded-md px-2 py-2 text-sm font-medium ${value === role ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>{labels[role]}</button>)}</div>{error && <p className="mt-1.5 text-xs text-red-700">{error}</p>}</fieldset>
}
