import { BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Navbar() {
  const [showMCQ, setShowMCQ] = useState(false)

  useEffect(() => {
    async function fetchMcqSettings() {
      try {
        const { data, error } = await supabase
          .from('mcq_settings')
          .select('is_public')
          .single()
        
        if (!error && data) {
          setShowMCQ(data.is_public)
        }
      } catch (err) {
        // Ignore errors
      }
    }
    if (supabase) {
      fetchMcqSettings()
    }
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <nav className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-6">
          <Link to="/" className="flex min-w-0 items-center gap-2 text-brand-blue sm:mr-4">
            <BookOpen className="h-6 w-6 shrink-0" aria-hidden="true" />
            <span className="truncate text-lg font-bold sm:text-xl">KUHS MLT Notes</span>
          </Link>
          <Link
            to="/questions"
            className="rounded-md px-2 py-1 text-sm font-semibold text-slate-700 transition hover:bg-brand-light hover:text-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2"
          >
            Question Bank
          </Link>
          {showMCQ && (
            <Link
              to="/mcq"
              className="rounded-md px-2 py-1 text-sm font-semibold text-slate-700 transition hover:bg-brand-light hover:text-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2"
            >
              MCQ Practice
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}
