import { Edit, Loader2, Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { SUBJECT_COLORS } from '../lib/constants'
import { adminRequest } from '../lib/adminApi'
import { useAdminAuth } from '../context/AdminAuth'

function formatDate(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
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
      {sort.key === sortKey && <span className="text-brand-blue">{sort.direction === 'asc' ? 'Asc' : 'Desc'}</span>}
    </button>
  )
}

function StatusBadge({ isActive }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-bold ${isActive ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-700'}`}>
      {isActive ? 'Active' : 'Hidden'}
    </span>
  )
}

function SubjectBadge({ subject }) {
  const colors = SUBJECT_COLORS[subject] ?? { bg: 'bg-slate-100', text: 'text-slate-800' }
  return <span className={`inline-flex rounded px-2 py-1 text-xs font-semibold ${colors.bg} ${colors.text}`}>{subject}</span>
}

function Actions({ item, isBusy, onToggle, onDelete, stacked = false }) {
  return (
    <div className={stacked ? 'grid gap-2' : 'flex flex-wrap gap-2'}>
      <Link
        to={`/admin/questions/edit/${item.id}`}
        className="inline-flex items-center justify-center gap-1 rounded-md bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-brand-light hover:text-brand-blue"
      >
        <Edit className="h-3.5 w-3.5" />
        Edit
      </Link>
      <button
        type="button"
        onClick={() => onToggle(item)}
        disabled={isBusy}
        className="rounded-md bg-brand-light px-3 py-2 text-xs font-bold text-brand-blue hover:bg-blue-100 disabled:opacity-50"
      >
        {item.is_active ? 'Hide' : 'Show'}
      </button>
      <button
        type="button"
        onClick={() => onDelete(item)}
        disabled={isBusy}
        className="inline-flex items-center justify-center gap-1 rounded-md bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100 disabled:opacity-50"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Delete
      </button>
    </div>
  )
}

export default function AdminQuestions() {
  const { adminPassword } = useAdminAuth()
  const [questions, setQuestions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [sort, setSort] = useState({ key: 'created_at', direction: 'desc' })
  const [busyId, setBusyId] = useState('')

  useEffect(() => { document.title = 'Questions — Admin Panel' }, [])

  async function loadItems() {
    setIsLoading(true)
    setError('')
    try {
      const data = await adminRequest('/api/admin/questions', { password: adminPassword })
      setQuestions(data.questions ?? [])
    } catch (err) {
      setError(err.message || 'Unable to load questions.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadItems() }, [])

  const sortedItems = useMemo(() => {
    return [...questions].sort((first, second) => {
      const firstValue = first[sort.key] ?? ''
      const secondValue = second[sort.key] ?? ''
      if (sort.key === 'created_at') {
        const firstTime = firstValue ? new Date(firstValue).getTime() : 0
        const secondTime = secondValue ? new Date(secondValue).getTime() : 0
        return sort.direction === 'asc' ? firstTime - secondTime : secondTime - firstTime
      }
      const comparison = String(firstValue).localeCompare(String(secondValue), undefined, { numeric: true, sensitivity: 'base' })
      return sort.direction === 'asc' ? comparison : -comparison
    })
  }, [questions, sort])

  function toggleSort(key) {
    setSort(curr => ({ key, direction: curr.key === key && curr.direction === 'asc' ? 'desc' : 'asc' }))
  }

  async function handleToggle(item) {
    setBusyId(item.id)
    try {
      const nextIsActive = !item.is_active
      await adminRequest(`/api/admin/question?id=${item.id}`, { method: 'PATCH', password: adminPassword, body: { is_active: nextIsActive } })
      toast.success(nextIsActive ? 'Question shown' : 'Question hidden')
      await loadItems()
    } catch (err) {
      toast.error('Unable to update question.')
    } finally {
      setBusyId('')
    }
  }

  async function handleDelete(item) {
    if (!window.confirm('Delete this question?')) return
    setBusyId(item.id)
    try {
      await adminRequest(`/api/admin/question?id=${item.id}`, { method: 'DELETE', password: adminPassword })
      toast.success('Question deleted')
      await loadItems()
    } catch (err) {
      toast.error('Unable to delete question.')
    } finally {
      setBusyId('')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-blue">Question Bank</h1>
          <p className="mt-2 text-sm font-semibold text-slate-600">{questions.length} total</p>
        </div>
        <Link to="/admin/questions/new" className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-blue px-4 py-3 text-sm font-semibold text-white hover:bg-brand-accent">
          <Plus className="h-4 w-4" />
          Add Question
        </Link>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}

      {isLoading ? (
        <div className="flex min-h-64 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm">
          <Loader2 className="h-6 w-6 animate-spin text-brand-blue" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:hidden">
            {sortedItems.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No questions yet.</div>
            ) : (
              sortedItems.map(q => (
                <article key={q.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <SubjectBadge subject={q.subject} />
                      <StatusBadge isActive={q.is_active} />
                    </div>
                    <h2 className="text-base font-bold leading-6 text-slate-950">{q.title}</h2>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="rounded bg-slate-100 px-2 py-1">{q.type}</span>
                      <span className="rounded bg-slate-100 px-2 py-1">{q.year}</span>
                      <span className="rounded bg-slate-100 px-2 py-1">{q.paper}</span>
                    </div>
                    <Actions item={q} isBusy={busyId === q.id} onToggle={handleToggle} onDelete={handleDelete} stacked />
                  </div>
                </article>
              ))
            )}
          </div>
          <div className="hidden overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm md:block">
            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500"><SortHeader label="Title" sortKey="title" sort={sort} onSort={toggleSort} /></th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500"><SortHeader label="Type" sortKey="type" sort={sort} onSort={toggleSort} /></th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Subject</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500"><SortHeader label="Year" sortKey="year" sort={sort} onSort={toggleSort} /></th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500"><SortHeader label="Paper" sortKey="paper" sort={sort} onSort={toggleSort} /></th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Exam Year</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {sortedItems.length === 0 ? (
                  <tr><td colSpan="8" className="p-8 text-center text-slate-500">No questions yet.</td></tr>
                ) : (
                  sortedItems.map(q => (
                    <tr key={q.id}>
                      <td className="px-4 py-4 text-sm font-semibold text-slate-950">{q.title}</td>
                      <td className="px-4 py-4 text-sm text-slate-700">{q.type}</td>
                      <td className="px-4 py-4 text-sm"><SubjectBadge subject={q.subject} /></td>
                      <td className="px-4 py-4 text-sm text-slate-700">{q.year}</td>
                      <td className="px-4 py-4 text-sm text-slate-700">{q.paper}</td>
                      <td className="px-4 py-4 text-sm text-slate-700">{q.exam_year || '-'}</td>
                      <td className="px-4 py-4"><StatusBadge isActive={q.is_active} /></td>
                      <td className="px-4 py-4"><Actions item={q} isBusy={busyId === q.id} onToggle={handleToggle} onDelete={handleDelete} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
