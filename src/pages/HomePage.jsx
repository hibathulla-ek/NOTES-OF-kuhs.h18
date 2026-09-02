import { Search, X, BookOpen, Sparkles, FileText, ArrowRight } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { SUBJECTS, PAPERS, YEARS, SUBJECT_COLORS } from '../lib/constants'
import { supabase, supabaseConfigError } from '../lib/supabase'
import toast from 'react-hot-toast'
import NoteCard from '../components/NoteCard'

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
  const [searchQuery, setSearchQuery] = useState('')
  const [allNotes, setAllNotes] = useState([])
  const [totalNotes, setTotalNotes] = useState(0)
  const [subjectCounts, setSubjectCounts] = useState(initialSubjectCounts)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Request form state
  const [requestTopic, setRequestTopic] = useState('')
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false)
  const [requestSuccess, setRequestSuccess] = useState(false)

  useEffect(() => {
    document.title = 'BRIGHTPATH DOCS — Find Your Notes Instantly'
  }, [])

  useEffect(() => {
    let isCurrent = true

    async function loadData() {
      setIsLoading(true)
      setError('')

      try {
        if (!supabase) {
          throw new Error(supabaseConfigError)
        }

        // Fetch all active notes for instant live search and subject counts
        const { data: notesData, error: notesError } = await supabase
          .from('notes')
          .select('*')
          .eq('is_active', true)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })

        if (notesError) {
          throw notesError
        }

        if (isCurrent) {
          const notes = notesData ?? []
          setAllNotes(notes)
          setTotalNotes(notes.length)

          // Calculate subject counts locally
          const counts = { ...initialSubjectCounts }
          for (const note of notes) {
            if (counts[note.subject] !== undefined) {
              counts[note.subject] += 1
            }
          }
          setSubjectCounts(counts)
        }
      } catch (noteError) {
        if (isCurrent) {
          setError(noteError.message || 'Unable to load notes.')
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isCurrent = false
    }
  }, [])

  // Instant client-side search across multiple fields
  const filteredNotes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) {
      return []
    }

    return allNotes.filter((note) => {
      const title = (note.title || '').toLowerCase()
      const subject = (note.subject || '').toLowerCase()
      const year = (note.year || '').toLowerCase()
      const paper = (note.paper || '').toLowerCase()
      const description = (note.description || '').toLowerCase()
      
      const keywords = Array.isArray(note.keywords)
        ? note.keywords.join(' ').toLowerCase()
        : typeof note.keywords === 'string'
        ? note.keywords.toLowerCase()
        : ''

      return (
        title.includes(query) ||
        subject.includes(query) ||
        keywords.includes(query) ||
        year.includes(query) ||
        paper.includes(query) ||
        description.includes(query)
      )
    })
  }, [allNotes, searchQuery])

  function handleSearchSubmit(event) {
    event.preventDefault()
    const trimmed = searchQuery.trim()
    if (trimmed) {
      // Keep on page with live results, or if user wants deeper search they can use full search
    }
  }

  function handleSubjectClick(subject) {
    navigate(`/search?subject=${encodeURIComponent(subject)}`)
  }

  async function handleRequestSubmit(event) {
    event.preventDefault()
    const topic = requestTopic.trim()
    if (topic.length < 3) return

    setIsSubmittingRequest(true)
    try {
      const { error: insertError } = await supabase
        .from('note_requests')
        .insert([{ topic }])
      if (insertError) throw insertError

      setRequestSuccess(true)
      setRequestTopic('')
      setTimeout(() => setRequestSuccess(false), 5000)
    } catch {
      toast.error('Failed to send request. Please try again.')
    } finally {
      setIsSubmittingRequest(false)
    }
  }

  const isSearching = searchQuery.trim().length > 0

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <main>
        {/* Hero Section */}
        <section className="bg-brand-blue px-4 py-16 text-center text-white sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold text-brand-light backdrop-blur-sm mb-4">
              <Sparkles className="h-3.5 w-3.5 text-yellow-300" aria-hidden="true" />
              BRIGHTPATH DOCS — BSc MLT Digital Study Portal
            </div>

            <h1 className="text-4xl font-bold tracking-normal sm:text-5xl lg:text-6xl">
              Find Your MLT Notes Instantly
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-brand-light sm:text-lg">
              All 4 years of KUHS BSc MLT notes — searchable by topic, paper, or subject with in-browser continuous scroll viewer
            </p>

            {/* Live Search Bar */}
            <form onSubmit={handleSearchSubmit} className="mx-auto mt-8 max-w-2xl">
              <label htmlFor="home-search" className="sr-only">
                Search notes
              </label>
              <div className="relative flex min-h-14 items-center rounded-xl bg-white px-4 shadow-xl ring-2 ring-white/30 focus-within:ring-4 focus-within:ring-brand-light transition">
                <Search className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
                <input
                  id="home-search"
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Try 'carbohydrate metabolism' or 'Gram staining'..."
                  className="min-w-0 flex-1 bg-transparent px-3 py-4 text-base font-medium text-slate-950 placeholder:text-slate-400 focus:outline-none"
                  autoComplete="off"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="mr-2 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none"
                    aria-label="Clear search query"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    if (searchQuery.trim()) {
                      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
                    }
                  }}
                  disabled={!searchQuery.trim()}
                  className="rounded-lg bg-brand-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Dynamic Results or Default Homepage Sections */}
        {isSearching ? (
          <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 transition-all duration-300">
            {/* Search header & counter */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                  Live Search Results
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-600">
                  Found <strong className="text-brand-blue">{filteredNotes.length}</strong>{' '}
                  {filteredNotes.length === 1 ? 'note' : 'notes'} matching "{searchQuery.trim()}"
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="inline-flex items-center gap-1.5 rounded-md bg-white border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-accent"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                  Clear Search
                </button>
                <Link
                  to={`/search?q=${encodeURIComponent(searchQuery.trim())}`}
                  className="inline-flex items-center gap-1.5 rounded-md bg-brand-light px-3 py-1.5 text-xs font-bold text-brand-blue hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-brand-accent"
                >
                  Advanced Filter
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* Results Grid */}
            {filteredNotes.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <FileText className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">No matching notes found</h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                  We couldn't find any note matching "{searchQuery.trim()}". Try searching for a different keyword or request this note below.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="inline-flex items-center gap-1.5 rounded-md bg-brand-blue px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent"
                  >
                    Clear Search
                  </button>
                  <a
                    href="#request-section"
                    onClick={(e) => {
                      e.preventDefault()
                      setRequestTopic(searchQuery.trim())
                      setSearchQuery('')
                      document.getElementById('request-section')?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-accent"
                  >
                    Request This Note
                  </a>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredNotes.map((note) => (
                  <NoteCard key={note.id} note={note} />
                ))}
              </div>
            )}
          </section>
        ) : (
          <>
            {/* Stats summary bar */}
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

            {/* Subject Cards Grid */}
            <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-brand-blue">Browse by Subject</h2>
                <Link
                  to="/search"
                  className="text-sm font-bold text-brand-blue hover:text-brand-accent hover:underline inline-flex items-center gap-1"
                >
                  View all notes
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
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
          </>
        )}

        {/* Note Request Section */}
        <section id="request-section" className="bg-slate-100 px-4 py-12 text-center sm:px-6 lg:px-8">
          <div className="mx-auto max-w-xl">
            <h2 className="text-2xl font-bold text-brand-blue">Can't find what you need?</h2>
            <p className="mt-2 text-sm text-slate-600">Request a note — we'll upload it soon.</p>

            {requestSuccess ? (
              <div className="mt-6 rounded-md bg-green-50 p-4 text-sm font-semibold text-green-800 border border-green-200">
                Request sent! We'll add it soon.
              </div>
            ) : (
              <form onSubmit={handleRequestSubmit} className="mt-6 flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={requestTopic}
                  onChange={(e) => setRequestTopic(e.target.value)}
                  maxLength={80}
                  placeholder="e.g. Iron deficiency anaemia"
                  className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
                  required
                  minLength={3}
                  disabled={isSubmittingRequest}
                />
                <button
                  type="submit"
                  disabled={isSubmittingRequest || requestTopic.trim().length < 3}
                  className="whitespace-nowrap rounded-md bg-brand-blue px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingRequest ? 'Sending...' : 'Send Request'}
                </button>
              </form>
            )}
            <p className="mt-3 text-xs text-slate-500 font-medium">Your requested note will be added within 12 hours.</p>
          </div>
        </section>
      </main>
    </div>
  )
}
