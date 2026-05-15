import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import QuestionCard from '../components/QuestionCard'
import { PAPERS, SUBJECTS, YEARS } from '../lib/constants'
import { supabase, supabaseConfigError } from '../lib/supabase'

function SkeletonCard() {
  return (
    <div className="min-h-64 animate-pulse rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="h-6 w-28 rounded bg-slate-200" />
      <div className="mt-5 h-5 w-4/5 rounded bg-slate-200" />
      <div className="mt-2 h-5 w-2/3 rounded bg-slate-200" />
      <div className="mt-4 flex gap-2">
        <div className="h-6 w-20 rounded bg-slate-100" />
        <div className="h-6 w-20 rounded bg-slate-100" />
      </div>
      <div className="mt-5 h-4 w-full rounded bg-slate-100" />
      <div className="mt-2 h-4 w-3/4 rounded bg-slate-100" />
      <div className="mt-8 h-10 w-full rounded bg-slate-200" />
    </div>
  )
}

function SearchInput({ value, onChange }) {
  return (
    <label className="block">
      <span className="sr-only">Search questions</span>
      <span className="flex min-h-12 items-center rounded-lg border border-slate-200 bg-white px-3 shadow-sm focus-within:ring-2 focus-within:ring-brand-accent">
        <Search className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search by topic, paper, or subject"
          className="min-w-0 flex-1 bg-transparent px-3 py-3 text-base text-slate-950 placeholder:text-slate-400 focus:outline-none"
        />
      </span>
    </label>
  )
}

function FilterPanel({ year, paper, subject, onSetParam, onClose }) {
  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between md:hidden">
        <h2 className="text-lg font-bold text-brand-blue">Filters</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-2 text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-accent"
          aria-label="Close filters"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <section>
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">Year</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {YEARS.map((yearOption) => {
            const isActive = year === yearOption
            return (
              <button
                key={yearOption}
                type="button"
                onClick={() => onSetParam('year', isActive ? '' : yearOption)}
                className={`rounded-full px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 ${
                  isActive ? 'bg-brand-blue text-white' : 'bg-slate-100 text-slate-700 hover:bg-brand-light hover:text-brand-blue'
                }`}
              >
                {yearOption}
              </button>
            )
          })}
        </div>
      </section>

      <section>
        <label htmlFor="paper-filter" className="text-sm font-bold uppercase tracking-wide text-slate-500">
          Paper
        </label>
        <select
          id="paper-filter"
          value={paper}
          onChange={(event) => onSetParam('paper', event.target.value)}
          className="mt-3 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
        >
          <option value="">All papers</option>
          {PAPERS.map((paperOption) => (
            <option key={paperOption} value={paperOption}>
              {paperOption}
            </option>
          ))}
        </select>
      </section>

      <section>
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">Subject</h3>
        <div className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1">
          {SUBJECTS.map((subjectOption) => (
            <label key={subjectOption} className="flex cursor-pointer items-start gap-3 rounded-md p-2 hover:bg-slate-50">
              <input
                type="checkbox"
                checked={subject === subjectOption}
                onChange={(event) => onSetParam('subject', event.target.checked ? subjectOption : '')}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-blue focus:ring-brand-accent"
              />
              <span className="text-sm font-medium leading-5 text-slate-700">{subjectOption}</span>
            </label>
          ))}
        </div>
      </section>
    </div>
  )
}

function FilterTags({ filters, onRemove, onClearAll }) {
  if (filters.length === 0) return null
  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      {filters.map((filter) => (
        <button
          key={filter.key}
          type="button"
          onClick={() => onRemove(filter.key)}
          className="inline-flex items-center gap-2 rounded-full bg-brand-light px-3 py-1.5 text-sm font-semibold text-brand-blue transition hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2"
        >
          {filter.label}
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="rounded-full px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2"
      >
        Clear All
      </button>
    </div>
  )
}

export default function QuestionBankPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const year = searchParams.get('year') ?? ''
  const paper = searchParams.get('paper') ?? ''
  const subject = searchParams.get('subject') ?? ''
  const type = searchParams.get('type') ?? 'Question Bank'

  const [searchInput, setSearchInput] = useState(query)
  const [debouncedQuery, setDebouncedQuery] = useState(query)
  const [questions, setQuestions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)

  useEffect(() => {
    document.title = 'Question Bank — KUHS MLT Notes'
  }, [])

  useEffect(() => {
    setSearchInput(query)
    setDebouncedQuery(query)
  }, [query])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(searchInput.trim())
      setSearchParams((currentParams) => {
        const nextParams = new URLSearchParams(currentParams)
        const trimmedValue = searchInput.trim()
        if (trimmedValue) nextParams.set('q', trimmedValue)
        else nextParams.delete('q')
        return nextParams
      })
    }, 300)
    return () => window.clearTimeout(timeoutId)
  }, [searchInput, setSearchParams])

  useEffect(() => {
    let isCurrent = true
    async function loadResults() {
      setIsLoading(true)
      setError('')
      try {
        if (!supabase) throw new Error(supabaseConfigError)
        
        let dbQuery = supabase.from('questions').select('*').eq('is_active', true).eq('type', type)
        if (year) dbQuery = dbQuery.eq('year', year)
        if (paper) dbQuery = dbQuery.eq('paper', paper)
        if (subject) dbQuery = dbQuery.eq('subject', subject)
        if (debouncedQuery) dbQuery = dbQuery.ilike('title', `%${debouncedQuery}%`)
        
        const { data, error } = await dbQuery.limit(50)
        if (error) throw error
        
        if (isCurrent) setQuestions(data ?? [])
      } catch (err) {
        if (isCurrent) {
          setQuestions([])
          setError(err.message || 'Unable to load questions.')
        }
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }
    loadResults()
    return () => { isCurrent = false }
  }, [debouncedQuery, year, paper, subject, type])

  const activeFilters = useMemo(
    () => [
      year ? { key: 'year', label: year } : null,
      paper ? { key: 'paper', label: paper } : null,
      subject ? { key: 'subject', label: subject } : null,
    ].filter(Boolean),
    [paper, subject, year]
  )
  const activeFilterCount = activeFilters.length

  function setUrlParam(key, value) {
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams)
      if (value) nextParams.set(key, value)
      else nextParams.delete(key)
      return nextParams
    })
  }

  function clearAllParams() {
    setSearchInput('')
    setSearchParams(new URLSearchParams({ type }))
    setIsFilterDrawerOpen(false)
  }

  const resultCountText = debouncedQuery
    ? `Showing ${questions.length} results for "${debouncedQuery}"`
    : `Showing ${questions.length} results`

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7">
          <h1 className="text-3xl font-bold text-brand-blue">Question Bank</h1>
          <p className="mt-2 text-sm text-slate-600">Find KUHS BSc MLT questions and previous year papers.</p>
        </div>

        <div className="mb-8 flex space-x-1 rounded-xl bg-slate-200 p-1">
          {['Question Bank', 'PYQ'].map((tabType) => (
            <button
              key={tabType}
              onClick={() => setUrlParam('type', tabType)}
              className={`w-full rounded-lg py-2.5 text-sm font-semibold leading-5 ${
                type === tabType
                  ? 'bg-white text-brand-blue shadow'
                  : 'text-slate-600 hover:bg-white/[0.12] hover:text-slate-800'
              }`}
            >
              {tabType === 'PYQ' ? 'Previous Year Questions (PYQ)' : tabType}
            </button>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-[17rem_minmax(0,1fr)]">
          <aside className="hidden md:block">
            <div className="sticky top-24 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <FilterPanel year={year} paper={paper} subject={subject} onSetParam={setUrlParam} />
            </div>
          </aside>

          <section>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex-1">
                <SearchInput value={searchInput} onChange={setSearchInput} />
              </div>
              <button
                type="button"
                onClick={() => setIsFilterDrawerOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-brand-blue shadow-sm transition hover:bg-brand-light focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 md:hidden"
              >
                <SlidersHorizontal className="h-5 w-5" aria-hidden="true" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="rounded-full bg-brand-blue px-2 py-0.5 text-xs font-bold text-white">{activeFilterCount}</span>
                )}
              </button>
            </div>

            <FilterTags filters={activeFilters} onRemove={(key) => setUrlParam(key, '')} onClearAll={clearAllParams} />

            <div className="mb-4 flex items-center justify-between gap-3">
              {isLoading ? (
                <div className="h-5 w-48 animate-pulse rounded bg-slate-200" />
              ) : (
                <p className="text-sm font-semibold text-slate-700">{resultCountText}</p>
              )}
            </div>

            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700">{error}</div>
            ) : isLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }, (_, index) => (
                  <SkeletonCard key={index} />
                ))}
              </div>
            ) : questions.length === 0 ? (
              <div className="flex min-h-80 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                <Search className="h-10 w-10 text-brand-accent" aria-hidden="true" />
                <p className="mt-4 max-w-md text-base font-semibold text-slate-700">
                  No questions found. Try a shorter keyword or clear your filters.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {questions.map((q) => (
                  <QuestionCard key={q.id} question={q} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <button
            type="button"
            className="absolute inset-0 h-full w-full bg-slate-950/40"
            onClick={() => setIsFilterDrawerOpen(false)}
            aria-label="Close filters"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-lg bg-white p-5 shadow-2xl">
            <FilterPanel
              year={year}
              paper={paper}
              subject={subject}
              onSetParam={setUrlParam}
              onClose={() => setIsFilterDrawerOpen(false)}
            />
          </div>
        </div>
      )}
    </main>
  )
}
