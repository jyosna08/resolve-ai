import { cloneElement, isValidElement } from 'react'

export const inputClassName = 'block w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100'

/** Label, input slot, hint, and accessible validation message. */
export default function FormField({ id, label, error, hint, children }) {
  const input = isValidElement(children) ? cloneElement(children, { id, 'aria-invalid': Boolean(error), 'aria-describedby': error ? `${id}-error` : hint ? `${id}-hint` : undefined, className: `${inputClassName} ${children.props.className || ''}` }) : children
  return <div className="space-y-1.5"><label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>{input}{hint && !error && <p id={`${id}-hint`} className="text-xs text-gray-500">{hint}</p>}{error && <p id={`${id}-error`} className="text-xs text-red-700">{error}</p>}</div>
}
