import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SUBJECTS, PAPERS, YEARS, SUBJECT_COLORS } from '../lib/constants'
import { supabase, supabaseConfigError } from '../lib/supabase'

const initialSubjectCounts = SUBJECTS.reduce((counts, subject) => {
  counts[subject] = 0
  return counts
}, {})

function StatSkeleton() {
  return (
    <div className="mx-auto h-7 w-full max-w-md animate-pulse rounded bg-brand-light" aria-label="Loading note count" />
  )
}

function SubjectCardSkeleton() {
  return (
    <div className="h-28 animate-pulse rounded-lg border border-l-4 border-slate-200 bg-white shadow-sm">
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 rounded bg-slate-200" />
        <div className="h-3 w-1/2 rounded bg-slate-100" />
      </div>
    </div>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [totalNotes, setTotalNotes] = useState(0)
  const [subjectCounts, setSubjectCounts] = useState(initialSubjectCounts)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = 'KUHS BSc MLT Notes Portal — Find Your Notes Instantly'
  }, [])

  useEffect(() => {
    let isCurrent = true

    async function loadNoteCounts() {
      setIsLoading(true)
      setError('')

      try {
        if (!supabase) {
          throw new Error(supabaseConfigError)
        }

        const { count: activeCount, error: totalError } = await supabase
          .from('notes')
          .select('id', { count: 'exact', head: true })
          .eq('is_active', true)

        if (totalError) {
          throw totalError
        }

        const countEntries = await Promise.all(
          SUBJECTS.map(async (subject) => {
            const { count, error: subjectError } = await supabase
              .from('notes')
              .select('id', { count: 'exact', head: true })
              .eq('is_active', true)
              .eq('subject', subject)

            if (subjectError) {
              throw subjectError
            }

            return [subject, count ?? 0]
          }),
        )

        if (isCurrent) {
          setTotalNotes(activeCount ?? 0)
          setSubjectCounts(Object.fromEntries(countEntries))
        }
      } catch (noteError) {
        if (isCurrent) {
          setError(noteError.message || 'Unable to load note counts.')
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false)
        }
      }
    }

    loadNoteCounts()

    return () => {
      isCurrent = false
    }
  }, [])

  function handleSearch(event) {
    event.preventDefault()
    const trimmedQuery = query.trim()

    if (trimmedQuery) {
      navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`)
    }
  }

  function handleSubjectClick(subject) {
    navigate(`/search?subject=${encodeURIComponent(subject)}`)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <main>
        <section className="bg-brand-blue px-4 py-16 text-center text-white sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-4xl font-bold tracking-normal sm:text-5xl lg:text-6xl">
              Find Your MLT Notes Instantly
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-brand-light sm:text-lg">
              All 4 years of KUHS BSc MLT notes — searchable by topic, paper, or subject
            </p>

            <form onSubmit={handleSearch} className="mx-auto mt-8 max-w-2xl">
              <label htmlFor="home-search" className="sr-only">
                Search notes
              </label>
              <div className="flex min-h-14 items-center rounded-lg bg-white px-4 shadow-lg ring-1 ring-white/20 focus-within:ring-2 focus-within:ring-brand-light">
                <Search className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
                <input
                  id="home-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Try 'carbohydrate metabolism' or 'Gram staining'..."
                  className="min-w-0 flex-1 bg-transparent px-3 py-4 text-base text-slate-950 placeholder:text-slate-400 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!query.trim()}
                  className="rounded-md bg-brand-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-white px-4 py-5 text-center sm:px-6 lg:px-8">
          {isLoading ? (
            <StatSkeleton />
          ) : error ? (
            <p className="text-sm font-medium text-red-700">{error}</p>
          ) : (
            <p className="text-lg font-semibold text-brand-blue">
              {totalNotes} notes across {PAPERS.length} papers and {YEARS.length} years
            </p>
          )}
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-brand-blue">Browse by Subject</h2>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {isLoading
              ? SUBJECTS.map((subject) => <SubjectCardSkeleton key={subject} />)
              : SUBJECTS.map((subject) => {
                  const colors = SUBJECT_COLORS[subject]

                  return (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => handleSubjectClick(subject)}
                      className={`min-h-28 rounded-lg border border-l-4 border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 ${colors.border}`}
                    >
                      <span className={`inline-flex rounded px-2 py-1 text-xs font-semibold ${colors.bg} ${colors.text}`}>
                        {subjectCounts[subject] ?? 0} notes
                      </span>
                      <span className="mt-3 block text-sm font-bold leading-5 text-slate-950 sm:text-base">
                        {subject}
                      </span>
                    </button>
                  )
                })}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-600 sm:px-6 lg:px-8">
        KUHS BSc MLT Notes Portal · For educational use only · 2025
      </footer>
    </div>
  )
}
