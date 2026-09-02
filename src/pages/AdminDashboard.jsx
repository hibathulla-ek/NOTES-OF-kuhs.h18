import { Edit, Eye, Loader2, Plus, RotateCcw, Search, Share2, Trash2, X, XCircle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { SUBJECT_COLORS } from '../lib/constants'
import { adminRequest } from '../lib/adminApi'
import { useAdminAuth } from '../context/AdminAuth'
import AdminNotePreviewModal from '../components/AdminNotePreviewModal'
import { getNoteShareUrl } from '../lib/slug'

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'hidden', label: 'Hidden' },
  { key: 'trash', label: 'Trash' },
]

function formatDate(value) {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function SortHeader({ label, sortKey, sort, onSort }) {
  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className="inline-flex items-center gap-1 rounded text-left hover:text-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-accent"
    >
      {label}
      {sort.key === sortKey ? <span className="text-brand-blue">{sort.direction === 'asc' ? 'Asc' : 'Desc'}</span> : null}
    </button>
  )
}

function StatusBadge({ isActive }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-xs font-bold transition-colors duration-200 ${
        isActive ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-700'
      }`}
    >
      {isActive ? 'Active' : 'Hidden'}
    </span>
  )
}

function SubjectBadge({ subject }) {
  const colors = SUBJECT_COLORS[subject] ?? { bg: 'bg-slate-100', text: 'text-slate-800' }

  return <span className={`inline-flex rounded px-2 py-1 text-xs font-semibold ${colors.bg} ${colors.text}`}>{subject}</span>
}

function NoteActions({ note, isBusy, isTrash, onPreview, onToggle, onDelete, onRestore, onPermanentDelete, onShare, stacked = false }) {
  if (isTrash) {
    return (
      <div className={stacked ? 'grid gap-2' : 'flex flex-wrap gap-2'}>
        <button
          type="button"
          onClick={() => onPreview(note)}
          className="inline-flex items-center justify-center gap-1 rounded-md bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-brand-light hover:text-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-accent"
          title="Preview note"
        >
          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
          View
        </button>
        <button
          type="button"
          onClick={() => onRestore(note)}
          disabled={isBusy}
          className="inline-flex items-center justify-center gap-1 rounded-md bg-brand-light px-3 py-2 text-xs font-bold text-brand-blue hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-brand-accent disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Restore
        </button>
        <button
          type="button"
          onClick={() => onPermanentDelete(note)}
          disabled={isBusy}
          className="inline-flex items-center justify-center gap-1 rounded-md bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
        >
          <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
          Delete Forever
        </button>
      </div>
    )
  }

  return (
    <div className={stacked ? 'grid gap-2' : 'flex flex-wrap gap-2'}>
      <button
        type="button"
        onClick={() => onPreview(note)}
        className="inline-flex items-center justify-center gap-1 rounded-md bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-brand-light hover:text-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-accent"
        title="Preview note"
      >
        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
        View
      </button>
      <Link
        to={`/admin/edit/${note.id}`}
        className="inline-flex items-center justify-center gap-1 rounded-md bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-brand-light hover:text-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-accent"
      >
        <Edit className="h-3.5 w-3.5" aria-hidden="true" />
        Edit
      </Link>
      <button
        type="button"
        onClick={() => onShare(note)}
        className="inline-flex items-center justify-center gap-1 rounded-md bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-brand-light hover:text-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-accent"
        title="Copy share link"
      >
        <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
        Share
      </button>
      <button
        type="button"
        onClick={() => onToggle(note)}
        disabled={isBusy}
        className={`rounded-md px-3 py-2 text-xs font-bold transition focus:outline-none focus:ring-2 focus:ring-brand-accent disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 ${
          note.is_active
            ? 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            : 'bg-brand-light text-brand-blue hover:bg-blue-100'
        }`}
      >
        {note.is_active ? 'Hide' : 'Unhide'}
      </button>
      <button
        type="button"
        onClick={() => onDelete(note)}
        disabled={isBusy}
        className="inline-flex items-center justify-center gap-1 rounded-md bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        Delete
      </button>
    </div>
  )
}

export default function AdminDashboard() {
  const { adminPassword } = useAdminAuth()
  const [notes, setNotes] = useState([])
  const [trashedNotes, setTrashedNotes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [sort, setSort] = useState({ key: 'created_at', direction: 'desc' })
  const [busyNoteId, setBusyNoteId] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [previewNote, setPreviewNote] = useState(null)
  const [exitingNoteIds, setExitingNoteIds] = useState(new Set())

  useEffect(() => {
    document.title = 'Admin — BRIGHTPATH DOCS'
  }, [])

  async function loadNotes(showSpinner = true) {
    if (showSpinner) {
      setIsLoading(true)
    }
    setError('')

    try {
      const [notesData, trashData] = await Promise.all([
        adminRequest('/api/admin/notes', { password: adminPassword }),
        adminRequest('/api/admin/notes?trash=true', { password: adminPassword }),
      ])
      setNotes(notesData.notes ?? [])
      setTrashedNotes(trashData.notes ?? [])
    } catch (dashboardError) {
      if (showSpinner) {
        setNotes([])
        setTrashedNotes([])
      }
      setError(dashboardError.message || 'Unable to load notes.')
    } finally {
      if (showSpinner) {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    loadNotes(true)
  }, [])

  const isTrashTab = activeTab === 'trash'

  const visibleNotes = useMemo(() => {
    let list = notes
    if (activeTab === 'trash') {
      list = trashedNotes
    } else if (activeTab === 'active') {
      list = notes.filter((note) => note.is_active || exitingNoteIds.has(note.id))
    } else if (activeTab === 'hidden') {
      list = notes.filter((note) => !note.is_active || exitingNoteIds.has(note.id))
    }

    const query = searchQuery.trim().toLowerCase()
    if (!query) {
      return list
    }

    return list.filter((note) => {
      const title = (note.title || '').toLowerCase()
      const subject = (note.subject || '').toLowerCase()
      const year = (note.year || '').toLowerCase()
      const paper = (note.paper || '').toLowerCase()

      return (
        title.includes(query) ||
        subject.includes(query) ||
        year.includes(query) ||
        paper.includes(query)
      )
    })
  }, [activeTab, notes, trashedNotes, searchQuery, exitingNoteIds])

  const sortedNotes = useMemo(() => {
    return [...visibleNotes].sort((first, second) => {
      const firstValue = first[sort.key] ?? ''
      const secondValue = second[sort.key] ?? ''

      if (sort.key === 'created_at') {
        const firstTime = firstValue ? new Date(firstValue).getTime() : 0
        const secondTime = secondValue ? new Date(secondValue).getTime() : 0
        return sort.direction === 'asc' ? firstTime - secondTime : secondTime - firstTime
      }

      const comparison = String(firstValue).localeCompare(String(secondValue), undefined, {
        numeric: true,
        sensitivity: 'base',
      })

      return sort.direction === 'asc' ? comparison : -comparison
    })
  }, [visibleNotes, sort])

  const activeCount = notes.filter((note) => note.is_active).length
  const hiddenCount = notes.length - activeCount
  const tabCounts = {
    all: notes.length,
    active: activeCount,
    hidden: hiddenCount,
    trash: trashedNotes.length,
  }

  function toggleSort(key) {
    setSort((currentSort) => ({
      key,
      direction: currentSort.key === key && currentSort.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  async function handleShare(note) {
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
      toast.error('Unable to copy link to clipboard')
    }
  }

  async function handleToggle(note) {
    setBusyNoteId(note.id)
    const nextIsActive = !note.is_active
    const shouldAnimateOut = (activeTab === 'active' && !nextIsActive) || (activeTab === 'hidden' && nextIsActive)

    if (shouldAnimateOut) {
      // Trigger smooth fade-out and collapse
      setExitingNoteIds((prev) => new Set(prev).add(note.id))
      await new Promise((resolve) => setTimeout(resolve, 300))
      setNotes((prev) => prev.map((n) => (n.id === note.id ? { ...n, is_active: nextIsActive } : n)))
      setExitingNoteIds((prev) => {
        const next = new Set(prev)
        next.delete(note.id)
        return next
      })
    } else {
      // In-place update on 'all' tab
      setNotes((prev) => prev.map((n) => (n.id === note.id ? { ...n, is_active: nextIsActive } : n)))
    }

    try {
      await adminRequest(`/api/admin/note?id=${encodeURIComponent(note.id)}`, {
        method: 'PATCH',
        password: adminPassword,
        body: { is_active: nextIsActive },
      })

      toast.success(nextIsActive ? 'Note unhidden' : 'Note hidden')
      // Background sync without full-table unmounting spinner
      loadNotes(false)
    } catch (toggleError) {
      // Rollback optimistic state
      setNotes((prev) => prev.map((n) => (n.id === note.id ? { ...n, is_active: note.is_active } : n)))
      toast.error(toggleError.message || 'Unable to update note.')
    } finally {
      setBusyNoteId('')
    }
  }

  async function handleDelete(note) {
    const confirmed = window.confirm('Move this note to Trash?')

    if (!confirmed) {
      return
    }

    setBusyNoteId(note.id)

    // Smooth removal animation
    setExitingNoteIds((prev) => new Set(prev).add(note.id))
    await new Promise((resolve) => setTimeout(resolve, 300))

    const deletedAt = new Date().toISOString()
    const deletedNote = { ...note, deleted_at: deletedAt }
    setNotes((prev) => prev.filter((n) => n.id !== note.id))
    setTrashedNotes((prev) => [deletedNote, ...prev])
    setExitingNoteIds((prev) => {
      const next = new Set(prev)
      next.delete(note.id)
      return next
    })

    try {
      await adminRequest(`/api/admin/note?id=${encodeURIComponent(note.id)}`, {
        method: 'DELETE',
        password: adminPassword,
      })

      toast.success('Note moved to Trash')
      loadNotes(false)
    } catch (deleteError) {
      // Rollback
      setNotes((prev) => [note, ...prev])
      setTrashedNotes((prev) => prev.filter((n) => n.id !== note.id))
      toast.error(deleteError.message || 'Unable to delete note.')
    } finally {
      setBusyNoteId('')
    }
  }

  async function handleRestore(note) {
    setBusyNoteId(note.id)

    setExitingNoteIds((prev) => new Set(prev).add(note.id))
    await new Promise((resolve) => setTimeout(resolve, 300))

    const restoredNote = { ...note, deleted_at: null }
    setTrashedNotes((prev) => prev.filter((n) => n.id !== note.id))
    setNotes((prev) => [restoredNote, ...prev])
    setExitingNoteIds((prev) => {
      const next = new Set(prev)
      next.delete(note.id)
      return next
    })

    try {
      await adminRequest(`/api/admin/note?id=${encodeURIComponent(note.id)}`, {
        method: 'PATCH',
        password: adminPassword,
        body: { deleted_at: null },
      })

      toast.success('Note restored')
      loadNotes(false)
    } catch (restoreError) {
      setTrashedNotes((prev) => [note, ...prev])
      setNotes((prev) => prev.filter((n) => n.id !== note.id))
      toast.error(restoreError.message || 'Unable to restore note.')
    } finally {
      setBusyNoteId('')
    }
  }

  async function handlePermanentDelete(note) {
    const confirmed = window.confirm('Permanently delete this note? This cannot be undone.')

    if (!confirmed) {
      return
    }

    setBusyNoteId(note.id)

    setExitingNoteIds((prev) => new Set(prev).add(note.id))
    await new Promise((resolve) => setTimeout(resolve, 300))

    setTrashedNotes((prev) => prev.filter((n) => n.id !== note.id))
    setExitingNoteIds((prev) => {
      const next = new Set(prev)
      next.delete(note.id)
      return next
    })

    try {
      await adminRequest(`/api/admin/note?id=${encodeURIComponent(note.id)}&permanent=true`, {
        method: 'DELETE',
        password: adminPassword,
      })

      toast.success('Note permanently deleted')
      loadNotes(false)
    } catch (deleteError) {
      setTrashedNotes((prev) => [note, ...prev])
      toast.error(deleteError.message || 'Unable to delete note.')
    } finally {
      setBusyNoteId('')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-blue">Dashboard</h1>
          <p className="mt-2 text-sm font-semibold text-slate-600">
            {notes.length} notes total ({activeCount} active, {hiddenCount} hidden)
          </p>
        </div>

        <Link
          to="/admin/new"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-blue px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add New Note
        </Link>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-slate-200 pb-3">
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-brand-accent ${
                activeTab === tab.key
                  ? 'bg-brand-blue text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-brand-light hover:text-brand-blue'
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-white text-slate-500'
                }`}
              >
                {tabCounts[tab.key]}
              </span>
            </button>
          ))}
        </div>

        <div className="w-full lg:w-80">
          <div className="relative flex items-center">
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, subject, year, paper..."
              className="w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-9 text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-accent"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-accent"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {searchQuery.trim() ? (
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
          <span>
            Found {sortedNotes.length} matching {sortedNotes.length === 1 ? 'note' : 'notes'} for "{searchQuery.trim()}"
          </span>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="text-brand-blue hover:underline focus:outline-none"
          >
            Clear filter
          </button>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>
      ) : null}

      {isTrashTab && !isLoading ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
          Notes here are permanently purged automatically after 30 days.
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex min-h-64 items-center justify-center rounded-lg border border-slate-200 bg-white text-brand-blue shadow-sm">
          <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
          <span className="ml-2 text-sm font-semibold">Loading notes</span>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:hidden">
            {sortedNotes.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-white px-4 py-12 text-center text-sm font-semibold text-slate-500 shadow-sm">
                {searchQuery.trim() ? (
                  <div>
                    <p>No notes found matching "{searchQuery}".</p>
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="mt-3 inline-flex items-center gap-1 rounded-md bg-brand-light px-3 py-1.5 text-xs font-bold text-brand-blue hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-brand-accent"
                    >
                      Clear search
                    </button>
                  </div>
                ) : isTrashTab ? (
                  'Trash is empty.'
                ) : (
                  'No notes yet.'
                )}
              </div>
            ) : (
              sortedNotes.map((note) => {
                const isBusy = busyNoteId === note.id
                const isExiting = exitingNoteIds.has(note.id)

                return (
                  <article
                    key={note.id}
                    className={`rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 ease-in-out ${
                      isExiting ? 'scale-95 opacity-0 -translate-y-2 pointer-events-none' : 'scale-100 opacity-100 translate-y-0'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <SubjectBadge subject={note.subject} />
                        {isTrashTab ? null : <StatusBadge isActive={note.is_active} />}
                      </div>
                      <h2 className="text-base font-bold leading-6 text-slate-950">
                        <button
                          type="button"
                          onClick={() => setPreviewNote(note)}
                          className="text-left font-bold text-slate-950 hover:text-brand-blue hover:underline focus:outline-none focus:ring-2 focus:ring-brand-accent rounded"
                          title="Click to preview note"
                        >
                          {note.title}
                        </button>
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{note.year}</span>
                        <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{note.paper}</span>
                      </div>
                      <NoteActions
                        note={note}
                        isBusy={isBusy}
                        isTrash={isTrashTab}
                        onPreview={setPreviewNote}
                        onToggle={handleToggle}
                        onDelete={handleDelete}
                        onRestore={handleRestore}
                        onPermanentDelete={handlePermanentDelete}
                        onShare={handleShare}
                        stacked
                      />
                    </div>
                  </article>
                )
              })
            )}
          </div>

          <div className="hidden overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm md:block">
            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    <SortHeader label="Title" sortKey="title" sort={sort} onSort={toggleSort} />
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Subject
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    <SortHeader label="Year" sortKey="year" sort={sort} onSort={toggleSort} />
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    <SortHeader label="Paper" sortKey="paper" sort={sort} onSort={toggleSort} />
                  </th>
                  {isTrashTab ? null : (
                    <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                  )}
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    <SortHeader label="Created" sortKey="created_at" sort={sort} onSort={toggleSort} />
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {sortedNotes.length === 0 ? (
                  <tr>
                    <td colSpan={isTrashTab ? 6 : 7} className="px-4 py-12 text-center text-sm font-semibold text-slate-500">
                      {searchQuery.trim() ? (
                        <div>
                          <p>No notes found matching "{searchQuery}".</p>
                          <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="mt-3 inline-flex items-center gap-1 rounded-md bg-brand-light px-3 py-1.5 text-xs font-bold text-brand-blue hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-brand-accent"
                          >
                            Clear search
                          </button>
                        </div>
                      ) : isTrashTab ? (
                        'Trash is empty.'
                      ) : (
                        'No notes yet.'
                      )}
                    </td>
                  </tr>
                ) : (
                  sortedNotes.map((note) => {
                    const isBusy = busyNoteId === note.id
                    const isExiting = exitingNoteIds.has(note.id)

                    return (
                      <tr
                        key={note.id}
                        className={`transition-all duration-300 ease-in-out ${
                          isExiting ? 'scale-95 opacity-0 pointer-events-none' : 'scale-100 opacity-100'
                        }`}
                      >
                        <td className="min-w-64 px-4 py-4 text-sm font-semibold text-slate-950">
                          <button
                            type="button"
                            onClick={() => setPreviewNote(note)}
                            className="text-left font-bold text-slate-950 hover:text-brand-blue hover:underline focus:outline-none focus:ring-2 focus:ring-brand-accent rounded"
                            title="Click to preview note"
                          >
                            {note.title}
                          </button>
                        </td>
                        <td className="min-w-56 px-4 py-4 text-sm text-slate-700">
                          <SubjectBadge subject={note.subject} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">{note.year}</td>
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">{note.paper}</td>
                        {isTrashTab ? null : (
                          <td className="whitespace-nowrap px-4 py-4">
                            <StatusBadge isActive={note.is_active} />
                          </td>
                        )}
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">{formatDate(note.created_at)}</td>
                        <td className="whitespace-nowrap px-4 py-4">
                          <NoteActions
                            note={note}
                            isBusy={isBusy}
                            isTrash={isTrashTab}
                            onPreview={setPreviewNote}
                            onToggle={handleToggle}
                            onDelete={handleDelete}
                            onRestore={handleRestore}
                            onPermanentDelete={handlePermanentDelete}
                            onShare={handleShare}
                          />
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
            </div>
          </div>
        </>
      )}

      {/* In-App Document Preview Modal */}
      <AdminNotePreviewModal
        note={previewNote}
        isOpen={Boolean(previewNote)}
        onClose={() => setPreviewNote(null)}
      />
    </div>
  )
}
