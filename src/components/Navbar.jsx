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
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
      <nav className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-3 sm:gap-6">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2 sm:gap-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2"
          >
            <img
              src="/logo-mark.png"
              alt="BrightPath Docs"
              className="h-8 w-8 shrink-0 object-contain sm:h-9 sm:w-9"
            />
            <span className="flex items-center font-sans text-base font-black tracking-tight sm:text-xl">
              <span className="text-brand-purple">BRIGHTPATH</span>
              <span className="ml-1 text-brand-yellow">DOCS</span>
            </span>
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              to="/questions"
              className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2 sm:px-3 sm:text-sm"
            >
              Question Bank
            </Link>
            {showMCQ && (
              <Link
                to="/mcq"
                className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2 sm:px-3 sm:text-sm"
              >
                MCQ Practice
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}
