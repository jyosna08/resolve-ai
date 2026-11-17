/** Small accessible progress indicator. */
export default function Spinner({ className = 'h-4 w-4' }) {
  return <span aria-label="Loading" role="status" className={`inline-block animate-spin rounded-full border-2 border-current border-r-transparent ${className}`} />
}
