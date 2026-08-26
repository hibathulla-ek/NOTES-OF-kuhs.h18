import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, BookOpen, ExternalLink, FileText, Loader2, Share2, Tag } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase, supabaseConfigError } from '../lib/supabase'
import { SUBJECT_COLORS } from '../lib/constants'
import { useDownloadLimit } from '../context/DownloadLimit'

export default function NoteDetailPage() {
  const { id } = useParams()
  const [note, setNote] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const { isLimitReached, downloadFile } = useDownloadLimit()

  useEffect(() => {
    let isCurrent = true

    async function loadNote() {
      setIsLoading(true)
      setError('')

      try {
        if (!supabase) {
          throw new Error(supabaseConfigError)
        }

        const { data, error: fetchError } = await supabase
          .from('notes')
          .select('*')
          .eq('id', id)
          .single()

        if (fetchError) {
          throw fetchError
        }

        if (!data || !data.is_active || data.deleted_at) {
          throw new Error('This note is currently unavailable or has been removed.')
        }

        if (isCurrent) {
          setNote(data)
          document.title = `${data.title} — KUHS MLT Notes`
        }
      } catch (err) {
        if (isCurrent) {
          setError(err.message || 'Note not found.')
          document.title = 'Note Not Found — KUHS MLT Notes'
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false)
        }
      }
    }

    loadNote()

    return () => {
      isCurrent = false
    }
  }, [id])

  async function handleShare() {
    const url = window.location.href
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
      } else {
        const textArea = document.createElement('textarea')
        textArea.value = url
        textArea.className = 'fixed opacity-0 pointer-events-none'
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }
      toast.success('Link copied to clipboard')
    } catch {
      toast.error('Unable to copy link')
    }
  }

  const colors = note ? SUBJECT_COLORS[note.subject] ?? { bg: 'bg-slate-100', text: 'text-slate-800' } : null

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/search"
            className="inline-flex items-center gap-2 rounded-md bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 hover:text-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to All Notes
          </Link>

          {note ? (
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-2 rounded-md bg-white px-3.5 py-2 text-sm font-semibold text-brand-blue shadow-sm transition hover:bg-brand-light focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2"
            >
              <Share2 className="h-4 w-4" aria-hidden="true" />
              Share Note
            </button>
          ) : null}
        </div>

        {isLoading ? (
          <div className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <Loader2 className="h-8 w-8 animate-spin text-brand-blue" aria-hidden="true" />
            <p className="mt-3 text-sm font-semibold text-slate-600">Loading note details...</p>
          </div>
        ) : error || !note ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
              <FileText className="h-7 w-7" aria-hidden="true" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-slate-950">Note Not Found</h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              {error || "The note you are looking for doesn't exist or is currently unavailable."}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                to="/search"
                className="inline-flex items-center justify-center rounded-md bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2"
              >
                Search Notes
              </Link>
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-md bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2"
              >
                Home
              </Link>
            </div>
          </div>
        ) : (
          <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex rounded px-2.5 py-1 text-xs font-semibold ${colors.bg} ${colors.text}`}>
                  {note.subject}
                </span>
                <span className="rounded bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                  {note.year}
                </span>
                <span className="rounded bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                  {note.paper}
                </span>
              </div>

              <h1 className="mt-4 text-2xl font-bold leading-tight text-slate-950 sm:text-3xl">
                {note.title}
              </h1>

              {note.description ? (
                <p className="mt-4 text-base leading-relaxed text-slate-600 whitespace-pre-line">
                  {note.description}
                </p>
              ) : (
                <p className="mt-4 text-sm italic text-slate-400">No description provided for this note.</p>
              )}

              {Array.isArray(note.keywords) && note.keywords.length > 0 ? (
                <div className="mt-6">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <Tag className="h-3.5 w-3.5" aria-hidden="true" />
                    Keywords & Topics
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {note.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-4 bg-slate-50/70 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <BookOpen className="h-4 w-4 text-brand-blue" aria-hidden="true" />
                <span>KUHS BSc MLT Study Resource</span>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                {note.drive_url ? (
                  <button
                    type="button"
                    onClick={() => downloadFile(note.id, 'note')}
                    disabled={isLimitReached}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-blue px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:opacity-50"
                  >
                    Open / Download Note
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-md bg-slate-200 px-6 py-3 text-sm font-semibold text-slate-500"
                  >
                    Note Unavailable
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          </article>
        )}
      </div>
    </main>
  )
}
