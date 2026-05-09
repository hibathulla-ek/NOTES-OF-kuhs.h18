import { BookOpen, Home, LayoutDashboard, LogOut, Menu, Plus, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Navigate, Outlet } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuth'

const navLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/new', label: 'Add Note', icon: Plus },
]

function AdminNav({ onNavigate }) {
  const { logout } = useAdminAuth()

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-2 text-brand-blue">
          <BookOpen className="h-6 w-6" aria-hidden="true" />
          <span className="text-lg font-bold">Admin Panel</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navLinks.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 ${
                isActive ? 'bg-brand-light text-brand-blue' : 'text-slate-700 hover:bg-slate-100 hover:text-brand-blue'
              }`
            }
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
            {label}
          </NavLink>
        ))}

        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2"
        >
          <Home className="h-5 w-5" aria-hidden="true" />
          View Public Site
        </a>
      </nav>

      <div className="border-t border-slate-200 p-3">
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
