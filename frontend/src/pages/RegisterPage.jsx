import { Link } from 'react-router-dom'
import AuthLayout from '@/components/auth/AuthLayout.jsx'
import RegisterForm from '@/components/auth/RegisterForm.jsx'

export default function RegisterPage() {
  return <AuthLayout title="Create your account" subtitle="Get started with ResolveAI." footer={<>Already have an account? <Link className="font-medium text-brand-600 hover:text-brand-700" to="/login">Log in</Link></>}><RegisterForm /></AuthLayout>
}
