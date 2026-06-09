import { Loader2, Mail, Lock } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuth'
import toast from 'react-hot-toast'

export default function AdminLogin() {
  const { isAuthenticated, sendOtp, login } = useAdminAuth()
  const navigate = useNavigate()
  
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    document.title = 'Admin — KUHS MLT Notes'
  }, [])

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />
  }

  async function handleSendOtp(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await sendOtp(email)
      setOtpSent(true)
      toast.success('Verification code sent to your email!')
    } catch (err) {
      setError(err?.message || 'Failed to send verification code. Check your email or try again later.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleVerifyOtp(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const didLogin = await login(email, otp)
      if (didLogin) {
        toast.success('Logged in successfully!')
        navigate('/admin/dashboard')
      } else {
        setError('Incorrect verification code.')
      }
    } catch (err) {
      setError(err?.message || 'Incorrect verification code or cooldown active.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-brand-light text-brand-blue">
          {otpSent ? <Lock className="h-6 w-6" aria-hidden="true" /> : <Mail className="h-6 w-6" aria-hidden="true" />}
        </div>
        <h1 className="mt-5 text-center text-2xl font-bold text-brand-blue">Admin Portal</h1>
        <p className="mt-1 text-center text-sm text-slate-500">
          {otpSent ? 'Enter the verification code sent to your email' : 'Sign in using your admin email address'}
        </p>

        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="mt-6 space-y-4">
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

            {error ? <p className="text-sm font-semibold text-red-700">{error}</p> : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand-blue px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              Send Verification Code
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Admin Email</span>
              <input
                type="email"
                value={email}
                disabled
                className="mt-2 w-full rounded-md border border-slate-100 bg-slate-50 px-3 py-3 text-base text-slate-500 shadow-sm cursor-not-allowed"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">6-Digit Verification Code</span>
              <input
                type="text"
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                placeholder="123456"
                maxLength={6}
                pattern="\d{6}"
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-3 text-base text-slate-950 tracking-widest text-center font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
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
              Verify & Login
            </button>

            <div className="flex items-center justify-between text-xs mt-4">
              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="text-slate-600 hover:text-brand-blue font-medium transition"
                disabled={isSubmitting}
              >
                ← Back to Email
              </button>
              <button
                type="button"
                onClick={handleSendOtp}
                className="text-brand-blue hover:underline font-semibold"
                disabled={isSubmitting}
              >
                Resend Code
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  )
}
