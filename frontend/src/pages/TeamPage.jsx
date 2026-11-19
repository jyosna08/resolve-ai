import { useState } from 'react'
import CreateUserForm from '@/components/admin/CreateUserForm.jsx'
import NoticeBanner from '@/components/common/NoticeBanner.jsx'
import { ROLES } from '@/utils/constants.js'

const roleLabels = { [ROLES.AGENT]: 'Agent', [ROLES.ADMIN]: 'Administrator' }

/** Team management page composition for administrators. */
export default function TeamPage() {
  const [notice, setNotice] = useState('')
  function handleCreated(user) {
    const label = roleLabels[user.role]
    setNotice(`${label} ${user.fullName} created. They can sign in with the email and password you set.`)
  }

  return <div className="mx-auto max-w-3xl space-y-6">
    <header><h1 className="text-2xl font-bold tracking-tight text-gray-900">Team</h1><p className="mt-1 text-sm text-gray-600">Create agent and administrator accounts.</p></header>
    {notice && <NoticeBanner message={notice} onDismiss={() => setNotice('')} />}
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"><h2 className="mb-5 text-lg font-semibold text-gray-900">Create team account</h2><CreateUserForm onCreated={handleCreated} /></section>
  </div>
}
