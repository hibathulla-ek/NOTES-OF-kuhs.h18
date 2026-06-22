import { Loader2, Lock } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuth'
import toast from 'react-hot-toast'

export default function AdminLogin() {
  const { isAuthenticated, login } = useAdminAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    document.title = 'Admin — KUHS MLT Notes'
  }, [])

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />
  }

  async function handleLogin(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const didLogin = await login(email, password)
      if (didLogin) {
        toast.success('Logged in successfully!')
        navigate('/admin/dashboard')
      } else {
        setError('Incorrect email or password.')
      }
    } catch (err) {
      setError(err?.message || 'Incorrect email or password.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-brand-light text-brand-blue">
          <Lock className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-center text-2xl font-bold text-brand-blue">Admin Portal</h1>
        <p className="mt-1 text-center text-sm text-slate-500">Sign in with your admin email and password</p>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Admin Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@example.com"
              className="mt-2 w-full rounded-md border border-slate-200 px-3 py-3 text-base text-slate-950 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
              required
              disabled={isSubmitting}
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className="mt-2 w-full rounded-md border border-slate-200 px-3 py-3 text-base text-slate-950 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
              required
              disabled={isSubmitting}
            />
          </label>

          {error ? <p className="text-sm font-semibold text-red-700">{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand-blue px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            Log In
          </button>
        </form>
      </div>
    </main>
  )
}
