import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Edit, ExternalLink, Share2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { SUBJECT_COLORS } from '../lib/constants'
import NativePdfViewer from './NativePdfViewer'
import { extractGoogleDriveFileId } from '../lib/driveEmbed'
import { getNoteShareUrl } from '../lib/noteSlug'

export default function AdminNotePreviewModal({ note, isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return

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
  }, [isOpen, onClose])

  if (!isOpen || !note) {
    return null
  }

  const colors = SUBJECT_COLORS[note.subject] ?? { bg: 'bg-slate-100', text: 'text-slate-800' }
  const fileId = extractGoogleDriveFileId(note.drive_url)

  async function handleShare() {
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
      toast.error('Unable to copy link to clipboard')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-2 backdrop-blur-sm sm:p-4 md:p-6"
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
              Admin Native PDF Preview
            </div>
          </div>
        </div>

        {/* Modal Body / Native PDF Viewer */}
        <div className="relative flex-1 bg-slate-900 p-2 sm:p-4">
          <NativePdfViewer
            fileId={fileId}
            driveUrl={note.drive_url}
            title={note.title}
            maxHeight="max-h-[72vh]"
          />
        </div>
      </div>
    </div>
  )
}
