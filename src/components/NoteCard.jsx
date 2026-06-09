import { ExternalLink } from 'lucide-react'
import { SUBJECT_COLORS } from '../lib/constants'
import { useDownloadLimit } from '../context/DownloadLimit'

export default function NoteCard({ note }) {
  const colors = SUBJECT_COLORS[note.subject] ?? {
    bg: 'bg-slate-100',
    text: 'text-slate-800',
  }
  const hasDriveUrl = Boolean(note.drive_url)
  const { isLimitReached, downloadFile } = useDownloadLimit()

  return (
    <article className="flex min-h-64 flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex-1">
        <div className="mb-3">
          <span className={`inline-flex rounded px-2 py-1 text-xs font-semibold ${colors.bg} ${colors.text}`}>
            {note.subject}
          </span>
        </div>

        <h2 className="line-clamp-2 text-lg font-semibold leading-6 text-slate-950">{note.title}</h2>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{note.year}</span>
          <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{note.paper}</span>
        </div>

        <p className="mt-4 line-clamp-2 text-sm leading-6 text-gray-500">
          {note.description || 'No description available.'}
        </p>
      </div>

      {hasDriveUrl ? (
        <button
          type="button"
          onClick={() => downloadFile(note.id, 'note')}
          disabled={isLimitReached}
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-md bg-brand-blue px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Open Note
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : (
        <button
          type="button"
          disabled
          className="mt-5 inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-md bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-500"
        >
          Open Note
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </article>
  )
}
