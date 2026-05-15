import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase, supabaseConfigError } from '../lib/supabase'
import { PAPERS, SUBJECTS, YEARS } from '../lib/constants'

export default function MCQPage() {
  const [isPublic, setIsPublic] = useState(null)
  const [mcqs, setMcqs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Filters
  const [subject, setSubject] = useState('')
  const [year, setYear] = useState('')
  const [paper, setPaper] = useState('')

  // Quiz State
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [score, setScore] = useState(0)
  const [isFinished, setIsFinished] = useState(false)

  useEffect(() => {
    document.title = 'MCQ Practice — KUHS MLT Notes'
    async function checkPublic() {
      try {
        const { data, error } = await supabase.from('mcq_settings').select('is_public').single()
        if (!error && data) setIsPublic(data.is_public)
        else setIsPublic(false)
      } catch {
        setIsPublic(false)
      }
    }
    if (supabase) checkPublic()
  }, [])

  useEffect(() => {
    if (isPublic !== true) {
      setIsLoading(false)
      return
    }

    async function fetchMcqs() {
      setIsLoading(true)
      try {
        if (!supabase) throw new Error(supabaseConfigError)

        let query = supabase.from('mcqs').select('*').eq('is_active', true)
        if (subject) query = query.eq('subject', subject)
        if (year) query = query.eq('year', year)
        if (paper) query = query.eq('paper', paper)

        const { data, error } = await query
        if (error) throw error
        
        setMcqs(data ?? [])
        // reset quiz
        setCurrentIndex(0)
        setSelectedOption(null)
        setScore(0)
        setIsFinished(false)
      } catch (err) {
        setError(err.message || 'Unable to load MCQs.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchMcqs()
  }, [isPublic, subject, year, paper])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
      </div>
    )
  }

  if (isPublic === false) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 px-4">
        <p className="text-xl font-bold text-slate-700">MCQ Practice is not available right now.</p>
      </div>
    )
  }

  const currentMcq = mcqs[currentIndex]

  function handleOptionClick(opt) {
    if (selectedOption) return // already answered
    setSelectedOption(opt)
    if (opt === currentMcq.correct_option) {
      setScore(s => s + 1)
    }
  }

  function handleNext() {
    if (currentIndex < mcqs.length - 1) {
      setCurrentIndex(i => i + 1)
      setSelectedOption(null)
    } else {
      setIsFinished(true)
    }
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold text-brand-blue">MCQ Practice</h1>

        {!isFinished && (
          <div className="mb-8 grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-3">
            <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full rounded border border-slate-300 p-2 text-sm focus:border-brand-accent focus:ring-1 focus:ring-brand-accent">
              <option value="">All Subjects</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={year} onChange={(e) => setYear(e.target.value)} className="w-full rounded border border-slate-300 p-2 text-sm focus:border-brand-accent focus:ring-1 focus:ring-brand-accent">
              <option value="">All Years</option>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select value={paper} onChange={(e) => setPaper(e.target.value)} className="w-full rounded border border-slate-300 p-2 text-sm focus:border-brand-accent focus:ring-1 focus:ring-brand-accent">
              <option value="">All Papers</option>
              {PAPERS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        )}

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>
        ) : mcqs.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
            No MCQs found matching your filters.
          </div>
        ) : isFinished ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">Quiz Completed!</h2>
            <p className="mt-4 text-lg font-medium text-slate-700">
              You got {score} out of {mcqs.length} correct.
            </p>
            <button
              onClick={() => {
                setCurrentIndex(0)
                setSelectedOption(null)
                setScore(0)
                setIsFinished(false)
              }}
              className="mt-6 inline-flex rounded-md bg-brand-blue px-6 py-2 text-sm font-semibold text-white transition hover:bg-brand-accent"
            >
              Restart Quiz
            </button>
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-sm font-bold tracking-wide text-slate-500">
                Question {currentIndex + 1} of {mcqs.length}
              </span>
              <div className="flex gap-2">
                <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold">{currentMcq.subject}</span>
                <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold">{currentMcq.year}</span>
              </div>
            </div>

            <p className="mb-8 text-lg font-bold text-slate-900 sm:text-xl">
              {currentMcq.question}
            </p>

            <div className="space-y-3">
              {['A', 'B', 'C', 'D'].map(opt => {
                const optionText = currentMcq[`option_${opt.toLowerCase()}`]
                const isSelected = selectedOption === opt
                const isCorrect = opt === currentMcq.correct_option

                let btnClass = "w-full text-left rounded-lg border-2 p-4 font-medium transition focus:outline-none "
                if (!selectedOption) {
                  btnClass += "border-slate-200 hover:border-brand-blue hover:bg-brand-light"
                } else if (isCorrect) {
                  btnClass += "border-green-500 bg-green-50 text-green-900"
                } else if (isSelected && !isCorrect) {
                  btnClass += "border-red-500 bg-red-50 text-red-900"
                } else {
                  btnClass += "border-slate-200 opacity-50"
                }

                return (
                  <button
                    key={opt}
                    onClick={() => handleOptionClick(opt)}
                    disabled={!!selectedOption}
                    className={btnClass}
                  >
                    <span className="mr-3 font-bold">{opt}.</span> {optionText}
                  </button>
                )
              })}
            </div>

            {selectedOption && (
              <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-2">
                {currentMcq.explanation && (
                  <div className="rounded-lg bg-blue-50 p-4">
                    <h4 className="font-bold text-brand-blue">Explanation:</h4>
                    <p className="mt-1 text-sm text-slate-700">{currentMcq.explanation}</p>
                  </div>
                )}
                
                <div className="flex justify-end">
                  <button
                    onClick={handleNext}
                    className="inline-flex rounded-md bg-brand-blue px-6 py-2 text-sm font-semibold text-white transition hover:bg-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2"
                  >
                    {currentIndex < mcqs.length - 1 ? 'Next Question' : 'Finish Quiz'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
