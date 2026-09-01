import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, BookOpen, Download, FileText, Loader2, Share2, Tag } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase, supabaseConfigError } from '../lib/supabase'
import { SUBJECT_COLORS } from '../lib/constants'
import { useDownloadLimit } from '../context/DownloadLimit'
import NativePdfViewer from '../components/NativePdfViewer'
import { extractGoogleDriveFileId } from '../lib/driveEmbed'
import { generateNoteSlug, getNotePath, getNoteShareUrl } from '../lib/slug'

export default function NoteDetailPage() {
  const { slug, id } = useParams()
  const rawParam = (slug || id || '').trim()
  const navigate = useNavigate()
  const location = useLocation()

  const [note, setNote] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const { isLimitReached, downloadFile } = useDownloadLimit()

  useEffect(() => {
    let isCurrent = true

    async function loadNote() {
      if (!rawParam) {
        setError('Note not found.')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError('')

      try {
        if (!supabase) {
          throw new Error(supabaseConfigError)
        }

        const isLegacyUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawParam)
        let noteData = null

        if (isLegacyUuid) {
          // 1. Direct legacy UUID lookup: fetch by exact ID
          const { data, error: fetchError } = await supabase
            .from('notes')
            .select('*')
            .eq('id', rawParam.toLowerCase())
            .maybeSingle()

          if (fetchError) throw fetchError
          noteData = data
        } else {
          // 2. Lookup by stored slug column
          const { data: slugData, error: slugError } = await supabase
            .from('notes')
            .select('*')
            .eq('slug', rawParam)
            .maybeSingle()

          if (slugData) {
            noteData = slugData
          } else {
            // 3. Fallback: Short ID prefix lookup (e.g. from title-slug-shortId or raw shortId)
            const shortId = (rawParam.includes('-') ? rawParam.split('-').pop() : rawParam).toLowerCase()
            const isShortHex = /^[0-9a-f]{8}$/i.test(shortId)

            if (isShortHex) {
              const { data: rangeData, error: rangeError } = await supabase
                .from('notes')
                .select('*')
                .gte('id', `${shortId}-0000-0000-0000-000000000000`)
                .lte('id', `${shortId}-ffff-ffff-ffff-ffffffffffff`)
                .limit(1)

              if (rangeError) throw rangeError
              noteData = rangeData && rangeData.length > 0 ? rangeData[0] : null
            }
          }
        }

        if (!noteData || !noteData.is_active || noteData.deleted_at) {
          throw new Error('This note is currently unavailable or has been removed.')
        }

        if (isCurrent) {
          setNote(noteData)
          document.title = `${noteData.title} — KUHS MLT Notes`

          // 301-style redirect: Auto-redirect legacy UUID or non-canonical URL to canonical slug URL
          const canonicalPath = getNotePath(noteData)
          if (location.pathname !== canonicalPath) {
            navigate(canonicalPath, { replace: true })
          }
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
  }, [rawParam])

  async function handleShare() {
    if (!note) return
    const shareUrl = getNoteShareUrl(note)
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl)
      } else {
        const textArea = document.createElement('textarea')
        textArea.value = shareUrl
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
  const fileId = note ? extractGoogleDriveFileId(note.drive_url) : null

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Navigation & Share */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/search"
            className="inline-flex items-center gap-2 rounded-md bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 hover:text-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to All Notes
          </Link>

          {note ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-2 rounded-md bg-white px-3.5 py-2 text-sm font-semibold text-brand-blue shadow-sm transition hover:bg-brand-light focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2"
              >
                <Share2 className="h-4 w-4" aria-hidden="true" />
                Share Note
              </button>

              {note.drive_url ? (
                <button
                  type="button"
                  onClick={() => downloadFile(note.id, 'note')}
                  disabled={isLimitReached}
                  className="inline-flex items-center gap-2 rounded-md bg-brand-blue px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:opacity-50"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Download Note
                </button>
              ) : null}
            </div>
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
          <div className="space-y-6">
            {/* Note Metadata Header */}
            <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="p-6 sm:p-8">
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
                  <p className="mt-3 text-base leading-relaxed text-slate-600 whitespace-pre-line">
                    {note.description}
                  </p>
                ) : null}

                {Array.isArray(note.keywords) && note.keywords.length > 0 ? (
                  <div className="mt-4 flex flex-wrap items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                    {note.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </article>

            {/* Native In-Browser Continuous Scroll PDF Viewer */}
            <section aria-label="PDF Document Viewer" className="rounded-xl overflow-hidden shadow-md">
              <NativePdfViewer
                fileId={fileId}
                driveUrl={note.drive_url}
                title={note.title}
                maxHeight="max-h-[85vh]"
              />
            </section>

            {/* Footer info card */}
            <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-brand-blue shrink-0" aria-hidden="true" />
                <span>KUHS BSc Medical Laboratory Technology digital curriculum notes</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                <span>Subject: {note.subject}</span>
                <span>•</span>
                <span>{note.year}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
