import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShieldAlert, RefreshCw, Clock, Calendar, Lock, CheckCircle2, AlertTriangle, BookOpen } from 'lucide-react'
import { useSiteSettings } from '../context/SiteSettingsContext'

function formatDateTime(isoString) {
  if (!isoString) return null
  try {
    const date = new Date(isoString)
    if (isNaN(date.getTime())) return null

    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    }).format(date) + ' IST'
  } catch {
    return null
  }
}

function calculateTimeLeft(targetDate) {
  if (!targetDate) return null
  const difference = new Date(targetDate).getTime() - new Date().getTime()
  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isCompleted: true }
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    isCompleted: false,
  }
}

export default function MaintenancePage() {
  const { settings, refreshSettings } = useSiteSettings()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(settings?.end_time))

  useEffect(() => {
    document.title = settings?.maintenance_title || 'System Maintenance Underway'
  }, [settings?.maintenance_title])

  useEffect(() => {
    if (!settings?.end_time) {
      setTimeLeft(null)
      return
    }

    setTimeLeft(calculateTimeLeft(settings.end_time))

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(settings.end_time))
    }, 1000)

    return () => clearInterval(timer)
  }, [settings?.end_time])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshSettings()
    } finally {
      setTimeout(() => {
        setIsRefreshing(false)
      }, 600)
    }
  }

  const title = settings?.maintenance_title || 'System Maintenance Underway'
  const message =
    settings?.maintenance_message ||
    'We are currently upgrading the platform to serve you better. Public access is temporarily paused.'

  const formattedStart = formatDateTime(settings?.start_time)
  const formattedEnd = formatDateTime(settings?.end_time)

  return (
    <div className="flex min-h-screen flex-col justify-between bg-slate-50 text-slate-900 selection:bg-brand-blue selection:text-white">
      {/* Top Brand Bar */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo-mark.png" alt="BrightPath Docs" className="h-8 w-8 shrink-0 object-contain" />
            <span className="flex items-center font-sans text-base font-black tracking-tight sm:text-lg">
              <span className="text-brand-purple">BRIGHTPATH</span>
              <span className="ml-1 text-brand-yellow">DOCS</span>
            </span>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
            </span>
            MAINTENANCE LOCKDOWN
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-2xl text-center">
          {/* Animated Status Shield Icon */}
          <div className="relative mx-auto mb-8 flex h-24 w-24 items-center justify-center">
            <div className="absolute inset-0 animate-pulse rounded-full bg-brand-light/60 blur-xl"></div>
            <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-brand-light bg-gradient-to-br from-brand-blue to-brand-accent text-white shadow-xl shadow-brand-blue/15">
              <ShieldAlert className="h-12 w-12 stroke-[1.75]" />
            </div>
          </div>

          {/* Title & Announcement */}
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {title}
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
            {message}
          </p>

          {/* Countdown Timer Block (if end_time configured) */}
          {timeLeft && (
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                <Clock className="h-4 w-4 text-brand-blue" />
                {timeLeft.isCompleted ? 'Target Window Reached' : 'Estimated Time Remaining'}
              </div>

              {timeLeft.isCompleted ? (
                <div className="flex items-center justify-center gap-2 text-sm font-semibold text-amber-700">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <span>Finalizing updates. The platform will be live momentarily.</span>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2 sm:gap-4">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 sm:p-4">
                    <span className="block text-2xl font-black text-brand-blue sm:text-4xl">
                      {String(timeLeft.days).padStart(2, '0')}
                    </span>
                    <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:text-xs">
                      Days
                    </span>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 sm:p-4">
                    <span className="block text-2xl font-black text-brand-blue sm:text-4xl">
                      {String(timeLeft.hours).padStart(2, '0')}
                    </span>
                    <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:text-xs">
                      Hours
                    </span>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 sm:p-4">
                    <span className="block text-2xl font-black text-brand-blue sm:text-4xl">
                      {String(timeLeft.minutes).padStart(2, '0')}
                    </span>
                    <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:text-xs">
                      Minutes
                    </span>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 sm:p-4">
                    <span className="block text-2xl font-black text-brand-blue sm:text-4xl">
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </span>
                    <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:text-xs">
                      Seconds
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Schedule Window Information */}
          {(formattedStart || formattedEnd) && (
            <div className="mt-6 flex flex-col items-center justify-center gap-2 text-xs font-medium text-slate-500 sm:flex-row sm:gap-6">
              {formattedStart && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span>Started: <strong className="font-semibold text-slate-700">{formattedStart}</strong></span>
                </div>
              )}
              {formattedEnd && (
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-slate-400" />
                  <span>Expected completion: <strong className="font-semibold text-slate-700">{formattedEnd}</strong></span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-blue px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 disabled:opacity-70 sm:w-auto"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Checking System Status...' : 'Refresh Page'}</span>
            </button>
          </div>

          <p className="mt-6 text-xs text-slate-400">
            All medical laboratory study notes, question banks, and MCQ modules will be restored automatically as soon as maintenance concludes.
          </p>
        </div>
      </main>

      {/* Footer & Admin Bypass Link */}
      <footer className="border-t border-slate-200 bg-white px-4 py-4 text-center text-xs text-slate-500 sm:px-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 sm:flex-row">
          <span>&copy; {new Date().getFullYear()} BRIGHTPATH DOCS. All rights reserved.</span>
          <Link
            to="/admin"
            className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-brand-blue hover:underline"
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Admin Portal</span>
          </Link>
        </div>
      </footer>
    </div>
  )
}
