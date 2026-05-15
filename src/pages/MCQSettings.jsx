import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useAdminAuth } from '../context/AdminAuth'
import { adminRequest } from '../lib/adminApi'

export default function MCQSettings() {
  const { adminPassword } = useAdminAuth()
  const [settings, setSettings] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    async function fetchSettings() {
      try {
        const data = await adminRequest('/api/admin/mcq_settings', { password: adminPassword })
        setSettings(data.settings)
      } catch (err) {
        toast.error('Failed to load MCQ settings.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchSettings()
  }, [adminPassword])

  async function handleToggle(checked) {
    if (!settings?.id) return
    setIsUpdating(true)
    try {
      const data = await adminRequest('/api/admin/mcq_settings', {
        method: 'PATCH',
        password: adminPassword,
        body: { id: settings.id, is_public: checked },
      })
      setSettings(data.settings)
      toast.success(checked ? 'MCQ Practice is now public' : 'MCQ Practice is now hidden')
    } catch (err) {
      toast.error('Failed to update MCQ settings.')
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm">
        <Loader2 className="h-6 w-6 animate-spin text-brand-blue" />
      </div>
    )
  }

  if (!settings) {
    return <div className="p-8 text-center text-slate-500">Settings not found.</div>
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-brand-blue">MCQ Settings</h1>
        <p className="mt-2 text-sm text-slate-600">Configure global MCQ practice availability.</p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">MCQ Practice — Public / Hidden</h3>
            <p className={`mt-1 text-sm font-semibold ${settings.is_public ? 'text-amber-600' : 'text-slate-500'}`}>
              {settings.is_public
                ? "Students will be able to see and use MCQ Practice once enabled."
                : "MCQ Practice is currently hidden from all students."}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={settings.is_public}
            disabled={isUpdating}
            onClick={() => handleToggle(!settings.is_public)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 disabled:opacity-50 ${
              settings.is_public ? 'bg-brand-blue' : 'bg-slate-200'
            }`}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                settings.is_public ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  )
}
