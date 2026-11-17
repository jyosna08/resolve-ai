import Logo from '@/components/common/Logo.jsx'

/** Centered card shell for authentication pages. */
export default function AuthLayout({ title, subtitle, children, footer }) {
  return <main className="flex min-h-screen items-center justify-center px-4 py-10"><div className="w-full max-w-md"><div className="mb-7 flex justify-center"><Logo /></div><section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"><header className="mb-6 text-center"><h1 className="text-2xl font-bold tracking-tight">{title}</h1><p className="mt-2 text-sm text-gray-500">{subtitle}</p></header>{children}{footer && <div className="mt-6 border-t border-gray-100 pt-5 text-center text-sm text-gray-600">{footer}</div>}</section></div></main>
}
