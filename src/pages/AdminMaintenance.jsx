import { useState, useEffect } from 'react'
import {
  ShieldAlert,
  Save,
  Loader2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Radio,
  ExternalLink,
  RotateCcw,
  Sparkles,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAdminAuth } from '../context/AdminAuth'
import { useSiteSettings } from '../context/SiteSettingsContext'
import { adminRequest } from '../lib/adminApi'

function toDatetimeLocal(isoString) {
  if (!isoString) return ''
  try {
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return ''
    // Format to local ISO without Z for input[type="datetime-local"]
    const offset = d.getTimezoneOffset() * 60000
    const localDate = new Date(d.getTime() - offset)
    return localDate.toISOString().slice(0, 16)
  } catch {
    return ''
  }
}

function toIsoString(datetimeLocal) {
  if (!datetimeLocal) return null
  try {
    const d = new Date(datetimeLocal)
    return isNaN(d.getTime()) ? null : d.toISOString()
  } catch {
    return null
  }
}

export default function AdminMaintenance() {
  const { adminPassword } = useAdminAuth()
  const { refreshSettings, setSettingsLocally } = useSiteSettings()

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [settingId, setSettingId] = useState(null)

  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false)
  const [maintenanceTitle, setMaintenanceTitle] = useState('System Maintenance Underway')
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    'We are currently upgrading the platform to serve you better. Public access is temporarily paused.'
  )
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  useEffect(() => {
    document.title = 'Maintenance Mode — BRIGHTPATH DOCS Admin'

    async function loadSettings() {
      try {
        const data = await adminRequest('/api/admin/site_settings', { password: adminPassword })
        if (data?.settings) {
          const s = data.settings
          setSettingId(s.id || null)
          setIsMaintenanceMode(Boolean(s.is_maintenance_mode))
          setMaintenanceTitle(s.maintenance_title || 'System Maintenance Underway')
          setMaintenanceMessage(
            s.maintenance_message ||
              'We are currently upgrading the platform to serve you better. Public access is temporarily paused.'
          )
          setStartTime(toDatetimeLocal(s.start_time))
          setEndTime(toDatetimeLocal(s.end_time))
        }
      } catch (err) {
        toast.error('Failed to load maintenance settings.')
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [adminPassword])

  const handleQuickDuration = (hours) => {
    const now = new Date()
    const target = new Date(now.getTime() + hours * 60 * 60 * 1000)
    setStartTime(toDatetimeLocal(now.toISOString()))
    setEndTime(toDatetimeLocal(target.toISOString()))
    toast.success(`Schedule set for next ${hours} hour${hours > 1 ? 's' : ''}`)
  }

  const handleClearSchedule = () => {
    setStartTime('')
    setEndTime('')
    toast.success('Schedule window cleared')
  }

  const handleResetDefaults = () => {
    setMaintenanceTitle('System Maintenance Underway')
    setMaintenanceMessage(
      'We are currently upgrading the platform to serve you better. Public access is temporarily paused.'
    )
    toast.success('Reset title and message to defaults')
  }

  const handleSave = async (e) => {
    if (e) e.preventDefault()
    setIsSaving(true)

    const payload = {
      id: settingId,
      is_maintenance_mode: isMaintenanceMode,
      maintenance_title: maintenanceTitle.trim() || 'System Maintenance Underway',
      maintenance_message:
        maintenanceMessage.trim() ||
        'We are currently upgrading the platform to serve you better. Public access is temporarily paused.',
      start_time: toIsoString(startTime),
      end_time: toIsoString(endTime),
    }

    try {
      const data = await adminRequest('/api/admin/site_settings', {
        method: 'PATCH',
        password: adminPassword,
        body: payload,
      })

      if (data?.settings) {
        setSettingId(data.settings.id)
        setSettingsLocally(data.settings)
        await refreshSettings()
      }

      toast.success(
        isMaintenanceMode
          ? '🔒 Public Lockdown Mode is now ACTIVE'
          : '✅ Maintenance Mode disabled (Public site is ONLINE)',
        { duration: 4000 }
      )
    } catch (err) {
      toast.error(err.message || 'Failed to save maintenance settings.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-slate-900">Maintenance Mode</h1>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-black uppercase tracking-wider ${
                isMaintenanceMode
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  isMaintenanceMode ? 'animate-pulse bg-rose-600' : 'bg-emerald-500'
                }`}
              />
              {isMaintenanceMode ? 'Lockdown Active' : 'Site Online'}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Control public access lockdown, scheduled maintenance windows, and visitor announcements.
          </p>
        </div>

        <a
          href="/maintenance"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-brand-blue"
        >
          <ExternalLink className="h-4 w-4" />
          Preview Maintenance Page
        </a>
      </div>

      {/* Main Lockdown Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Master Lockdown Switch Banner */}
        <div
          className={`rounded-2xl border p-6 shadow-sm transition-colors duration-200 ${
            isMaintenanceMode
              ? 'border-rose-300 bg-gradient-to-r from-rose-50 to-orange-50'
              : 'border-slate-200 bg-white'
          }`}
        >
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div className="flex items-start gap-4">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                  isMaintenanceMode
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-200'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Master Lockdown Switch
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  {isMaintenanceMode
                    ? '🚨 All public routes (notes, question bank, MCQ, search) are currently redirected to the Maintenance Screen. Admin panel remains fully accessible.'
                    : '🌐 The public portal is currently live and fully accessible to all students.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {isMaintenanceMode ? 'LOCKDOWN ON' : 'LOCKDOWN OFF'}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={isMaintenanceMode}
                disabled={isSaving}
                onClick={() => setIsMaintenanceMode((prev) => !prev)}
                className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 disabled:opacity-50 ${
                  isMaintenanceMode ? 'bg-rose-600' : 'bg-slate-300'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isMaintenanceMode ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Message & Title Configuration */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Announcement & Banner Text</h3>
              <p className="text-xs text-slate-500">Customize the headline and message displayed to users.</p>
            </div>
            <button
              type="button"
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-brand-blue"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Defaults
            </button>
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="maintenanceTitle" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Maintenance Headline / Title
              </label>
              <input
                id="maintenanceTitle"
                type="text"
                value={maintenanceTitle}
                onChange={(e) => setMaintenanceTitle(e.target.value)}
                placeholder="System Maintenance Underway"
                required
                className="mt-1 block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
              />
            </div>

            <div>
              <label htmlFor="maintenanceMessage" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Detailed Message / Reason
              </label>
              <textarea
                id="maintenanceMessage"
                rows={3}
                value={maintenanceMessage}
                onChange={(e) => setMaintenanceMessage(e.target.value)}
                placeholder="We are currently upgrading the platform to serve you better. Public access is temporarily paused."
                required
                className="mt-1 block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
              />
            </div>
          </div>
        </div>

        {/* Schedule Window */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-base font-bold text-slate-900">Scheduled Maintenance Window</h3>
              <p className="text-xs text-slate-500">
                Optional start and expected completion times. Enables the public countdown timer.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickDuration(1)}
                className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-brand-light hover:text-brand-blue"
              >
                +1 Hour
              </button>
              <button
                type="button"
                onClick={() => handleQuickDuration(2)}
                className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-brand-light hover:text-brand-blue"
              >
                +2 Hours
              </button>
              <button
                type="button"
                onClick={() => handleQuickDuration(6)}
                className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-brand-light hover:text-brand-blue"
              >
                +6 Hours
              </button>
              {(startTime || endTime) && (
                <button
                  type="button"
                  onClick={handleClearSchedule}
                  className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 hover:bg-red-100"
                >
                  Clear Window
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="startTime" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Scheduled Start Time
              </label>
              <div className="relative mt-1">
                <input
                  id="startTime"
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-500">When the maintenance period started or will start.</p>
            </div>

            <div>
              <label htmlFor="endTime" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Expected Completion Time (Countdown Target)
              </label>
              <div className="relative mt-1">
                <input
                  id="endTime"
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-500">Drives the live public ticking countdown clock.</p>
            </div>
          </div>
        </div>

        {/* Live Preview Card */}
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-6">
          <div className="mb-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
              <Sparkles className="h-4 w-4 text-brand-blue" />
              Public Preview (What Students Will See)
            </span>
            <span className="text-xs text-slate-400">Updates live as you type</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-blue text-white">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">
              {maintenanceTitle || 'System Maintenance Underway'}
            </h4>
            <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-slate-600">
              {maintenanceMessage || 'Public access is temporarily paused.'}
            </p>
            {endTime && (
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-brand-light/60 px-3 py-1 text-xs font-bold text-brand-blue">
                <Clock className="h-3.5 w-3.5" />
                Target: {new Date(endTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
              </div>
            )}
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-blue px-6 py-3 text-sm font-bold text-white shadow-md shadow-brand-blue/20 transition hover:bg-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
