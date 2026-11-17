import Spinner from './Spinner.jsx'

const variants = { primary: 'bg-brand-500 text-white hover:bg-brand-600', success: 'bg-green-600 text-white hover:bg-green-700', secondary: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50', ghost: 'text-gray-600 hover:bg-gray-100' }
const sizes = { sm: 'px-3 py-2 text-sm', md: 'px-4 py-2.5 text-sm' }

/** Reusable button with visual variant, size, and async loading state. */
export default function Button({ variant = 'primary', size = 'md', loading = false, fullWidth = false, className = '', children, disabled, ...props }) {
  return <button className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${fullWidth ? 'w-full' : ''} ${className}`} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
    {loading && <Spinner />} {children}
  </button>
}
