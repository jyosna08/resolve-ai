/** Compact rounded label used for role and status metadata. */
export default function Badge({ children, className = '' }) { return <span className={`inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700 ${className}`}>{children}</span> }
