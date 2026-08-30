import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Edit, ExternalLink, FileText, Loader2, Share2, X, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { SUBJECT_COLORS } from '../lib/constants'
import { getGoogleDriveEmbedUrl } from '../lib/driveEmbed'

export default function AdminNotePreviewModal({ note, isOpen, onClose }) {
  const [iframeLoading, setIframeLoading] = useState(true)

  useEffect(() => {
    if (!isOpen) return

    setIframeLoading(true)

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    document.body.classList.add('overflow-hidden')

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.classList.remove('overflow-hidden')
    }
  }, [isOpen, note?.id, onClose])

  if (!isOpen || !note) {
    return null
  }

  const embedUrl = getGoogleDriveEmbedUrl(note.drive_url)
  const colors = SUBJECT_COLORS[note.subject] ?? { bg: 'bg-slate-100', text: 'text-slate-800' }

  async function handleShare() {
    const shareUrl = `${window.location.origin}/notes/${note.id}`
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
      toast.error('Unable to copy link to clipboard')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-2 backdrop-blur-sm sm:p-4 md:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-modal-title"
    >
      <div className="relative flex max-h-[96vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/80 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex rounded px-2 py-0.5 text-xs font-semibold ${colors.bg} ${colors.text}`}>
                  {note.subject}
                </span>
                <span className="rounded bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
                  {note.year}
                </span>
                <span className="rounded bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
                  {note.paper}
                </span>
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${
                    note.is_active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {note.is_active ? 'Active' : 'Hidden'}
                </span>
              </div>
              <h2 id="preview-modal-title" className="mt-1.5 truncate text-base font-bold text-slate-950 sm:text-lg" title={note.title}>
                {note.title}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-accent"
              aria-label="Close preview"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* Action toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/60">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to={`/admin/edit/${note.id}`}
                className="inline-flex items-center justify-center gap-1.5 rounded-md bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-accent"
              >
                <Edit className="h-3.5 w-3.5" aria-hidden="true" />
                Edit Note
              </Link>
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center justify-center gap-1.5 rounded-md bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-accent"
              >
                <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
                Share Link
              </button>
              {note.drive_url ? (
                <a
                  href={note.drive_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-md bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-accent"
                >
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  Open in Drive
                </a>
              ) : null}
            </div>

            <div className="text-xs font-medium text-slate-500">
              Admin In-App Preview
            </div>
          </div>
        </div>

        {/* Modal Body / Iframe */}
        <div className="relative flex-1 bg-slate-100 p-2 sm:p-4">
          {embedUrl ? (
            <div className="relative h-[65vh] sm:h-[75vh] w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-inner">
              {iframeLoading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-50 text-slate-500">
                  <Loader2 className="h-8 w-8 animate-spin text-brand-blue" aria-hidden="true" />
                  <p className="text-xs font-semibold">Loading document preview...</p>
                </div>
              ) : null}
              <iframe
                src={embedUrl}
                title={`Preview - ${note.title}`}
                className="h-full w-full rounded-lg border-0"
                allow="autoplay"
                onLoad={() => setIframeLoading(false)}
              />
            </div>
          ) : (
            <div className="flex h-[65vh] sm:h-[75vh] w-full flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center shadow-inner">
              <div className="rounded-full bg-amber-50 p-3 text-amber-600">
                <AlertCircle className="h-8 w-8" aria-hidden="true" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-900">Unable to generate preview</h3>
              <p className="mt-1 max-w-sm text-xs text-slate-500">
                The note does not have a valid Google Drive file URL.
              </p>
              <Link
                to={`/admin/edit/${note.id}`}
                className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-brand-blue px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent"
              >
                <Edit className="h-3.5 w-3.5" aria-hidden="true" />
                Edit Note & Add Valid Drive Link
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
