import { BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-2 text-brand-blue">
          <BookOpen className="h-6 w-6 shrink-0" aria-hidden="true" />
          <span className="truncate text-lg font-bold sm:text-xl">KUHS MLT Notes</span>
        </Link>

        <Link
          to="/admin"
          className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-brand-light hover:text-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2"
        >
          Admin
        </Link>
      </nav>
    </header>
  )
}
