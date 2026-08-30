import { Link } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { SUBJECT_COLORS } from '../lib/constants'

export default function NoteCard({ note }) {
  const colors = SUBJECT_COLORS[note.subject] ?? {
    bg: 'bg-slate-100',
    text: 'text-slate-800',
  }

  return (
    <article className="flex min-h-64 flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:-translate-y-0.5">
      <div className="flex-1">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className={`inline-flex rounded px-2 py-1 text-xs font-semibold ${colors.bg} ${colors.text}`}>
            {note.subject}
          </span>
          <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            {note.year}
          </span>
        </div>

        <h2 className="line-clamp-2 text-lg font-bold leading-6 text-slate-950">
          <Link to={`/notes/${note.id}`} className="hover:text-brand-blue hover:underline">
            {note.title}
          </Link>
        </h2>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{note.year}</span>
          <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{note.paper}</span>
        </div>

        <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">
          {note.description || 'No description available.'}
        </p>

        {Array.isArray(note.keywords) && note.keywords.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1">
            {note.keywords.slice(0, 3).map((kw, i) => (
              <span key={i} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                {kw}
              </span>
            ))}
            {note.keywords.length > 3 ? (
              <span className="text-[11px] text-slate-400">+{note.keywords.length - 3} more</span>
            ) : null}
          </div>
        ) : null}
      </div>

      <Link
        to={`/notes/${note.id}`}
        className="mt-5 inline-flex items-center justify-center gap-2 rounded-md bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2"
      >
        <BookOpen className="h-4 w-4" aria-hidden="true" />
        Read Note
      </Link>
    </article>
  )
}
