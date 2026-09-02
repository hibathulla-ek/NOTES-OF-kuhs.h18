import { BookOpen, Home, LayoutDashboard, LogOut, Menu, Plus, X, MessageSquare, Database, HelpCircle, Settings, Eye, Activity, ShieldAlert } from 'lucide-react'
import { useState, useEffect } from 'react'
import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuth'
import { useSiteSettings } from '../context/SiteSettingsContext'
import { adminRequest } from '../lib/adminApi'
import { supabase } from '../lib/supabase'

const notesLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/new', label: 'Add Note', icon: Plus },
  { to: '/admin/requests', label: 'Note Requests', icon: MessageSquare, badge: 'pendingRequests' },
]

const questionLinks = [
  { to: '/admin/questions', label: 'All Questions', icon: Database },
  { to: '/admin/questions/new', label: 'Add Question', icon: Plus },
]

const mcqLinks = [
  { to: '/admin/mcq', label: 'All MCQs', icon: HelpCircle },
  { to: '/admin/mcq/settings', label: 'MCQ Settings', icon: Settings },
]

const systemLinks = [
  { to: '/admin/maintenance', label: 'Maintenance Mode', icon: ShieldAlert },
]


function AdminNav({ onNavigate }) {
  const { logout, adminPassword } = useAdminAuth()
  const { isMaintenanceMode } = useSiteSettings()
  const location = useLocation()
  const [stats, setStats] = useState({ views: 0, pendingRequests: 0 })

  useEffect(() => {
    let isCurrent = true

    async function loadStats() {
      try {
        const data = await adminRequest('/api/admin/stats', { password: adminPassword })
        if (data && isCurrent) {
          setStats({ views: data.views || 0, pendingRequests: data.pendingRequests || 0 })
        }
      } catch (err) {
        // fail silently
      }
    }

    loadStats()

    let channel = null
    if (supabase) {
      channel = supabase
        .channel('admin-stats-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'site_views' },
          () => {
            loadStats()
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'note_requests' },
          () => {
            loadStats()
          }
        )
        .subscribe()
    }

    const interval = setInterval(loadStats, 15000)

    return () => {
      isCurrent = false
      if (channel && supabase) {
        supabase.removeChannel(channel)
      }
      clearInterval(interval)
    }
  }, [location.pathname, adminPassword])

  function renderLinks(links) {
    return links.map(({ to, label, icon: Icon, badge }) => (
      <NavLink
        key={to}
        to={to}
        onClick={onNavigate}
        className={({ isActive }) =>
          `flex items-center justify-between rounded-md px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 ${
            isActive ? 'bg-brand-light text-brand-blue' : 'text-slate-700 hover:bg-slate-100 hover:text-brand-blue'
          }`
        }
      >
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5" aria-hidden="true" />
          {label}
        </div>
        {to === '/admin/maintenance' && isMaintenanceMode && (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-rose-700">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-600" />
            Lockdown
          </span>
        )}
        {badge && stats[badge] > 0 && (
          <span className="inline-flex h-5 items-center justify-center rounded-full bg-brand-blue px-2 text-xs font-bold text-white">
            {stats[badge]}
          </span>
        )}
      </NavLink>
    ))
  }

  return (
    <div className="flex h-full flex-col bg-white overflow-y-auto">
      <div className="border-b border-slate-200 px-5 py-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo-mark.png" alt="BrightPath Docs" className="h-7 w-7 shrink-0 object-contain" />
            <span className="flex items-center font-sans text-base font-black tracking-tight">
              <span className="text-brand-purple">BRIGHTPATH</span>
              <span className="ml-1 text-brand-yellow">DOCS</span>
            </span>
          </div>
          {isMaintenanceMode && (
            <span className="inline-flex items-center rounded bg-rose-600 px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-white shadow-sm">
              Lockdown
            </span>
          )}
        </div>
      </div>

      <nav className="flex-1 space-y-6 px-3 py-4">
        <div>
          <h3 className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-slate-500">Notes</h3>
          <div className="space-y-1">{renderLinks(notesLinks)}</div>
        </div>
        <div>
          <h3 className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-slate-500">Question Bank</h3>
          <div className="space-y-1">{renderLinks(questionLinks)}</div>
        </div>
        <div>
          <h3 className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-slate-500">MCQ</h3>
          <div className="space-y-1">{renderLinks(mcqLinks)}</div>
        </div>
        <div>
          <h3 className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-slate-500">System</h3>
          <div className="space-y-1">{renderLinks(systemLinks)}</div>
        </div>

        <div className="border-t border-slate-200 pt-4">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2"
          >
            <Home className="h-5 w-5" aria-hidden="true" />
            View Public Site
          </a>
        </div>
      </nav>

      <div className="border-t border-slate-200 p-4 shrink-0">
        <div className="mb-4 rounded-lg bg-slate-50 p-4 text-center border border-slate-100">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">Total Views</span>
          </div>
          <span className="block text-3xl font-black text-brand-blue">{typeof stats.views === 'number' ? stats.views.toLocaleString('en-IN') : stats.views}</span>
        </div>
      </div>

      <div className="border-t border-slate-200 p-3 shrink-0">
        <button
          type="button"
          onClick={() => {
            logout()
            onNavigate?.()
          }}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
        >
          <LogOut className="h-5 w-5" aria-hidden="true" />
          Logout
        </button>
      </div>
    </div>
  )
}

export default function AdminLayout() {
  const { isAuthenticated } = useAdminAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 text-slate-950">
      <div className="md:grid md:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className="hidden border-r border-slate-200 bg-white md:sticky md:top-16 md:block md:h-[calc(100vh-4rem)]">
          <AdminNav />
        </aside>

        <div className="md:hidden">
          <div className="sticky top-16 z-40 border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-brand-blue hover:bg-brand-light focus:outline-none focus:ring-2 focus:ring-brand-accent"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
              Menu
            </button>
          </div>
        </div>

        <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>

      {isMenuOpen ? (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Admin navigation">
          <button
            type="button"
            className="absolute inset-0 h-full w-full bg-slate-950/40"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close admin navigation"
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-2xl">
            <div className="flex justify-end border-b border-slate-200 p-2">
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="rounded-md p-2 text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-accent"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <AdminNav onNavigate={() => setIsMenuOpen(false)} />
          </div>
        </div>
      ) : null}
    </div>
  )
}
