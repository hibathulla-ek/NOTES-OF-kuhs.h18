import { useEffect, useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAdminAuth } from '../context/AdminAuth'
import { adminRequest } from '../lib/adminApi'

function formatDate(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(new Date(value))
}

export default function NoteRequests() {
  const { adminPassword } = useAdminAuth()
  const [requests, setRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [busyId, setBusyId] = useState('')

  async function loadRequests() {
    try {
      const data = await adminRequest('/api/admin/requests', { password: adminPassword })
      setRequests(data.requests ?? [])
    } catch (err) {
      toast.error('Failed to load requests')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadRequests() }, [])

  async function updateStatus(id, newStatus) {
    setBusyId(id)
    try {
      await adminRequest(`/api/admin/request?id=${id}`, {
        method: 'PATCH', password: adminPassword, body: { status: newStatus }
      })
      toast.success(`Request marked as ${newStatus}`)
      await loadRequests()
    } catch (err) {
      toast.error('Failed to update status')
    } finally {
      setBusyId('')
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this request?')) return
    setBusyId(id)
    try {
      await adminRequest(`/api/admin/request?id=${id}`, {
        method: 'DELETE', password: adminPassword
      })
      toast.success('Request deleted')
      await loadRequests()
    } catch (err) {
      toast.error('Failed to delete request')
    } finally {
      setBusyId('')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-brand-blue">Note Requests</h1>
      </div>

      {isLoading ? (
        <div className="flex min-h-64 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm">
          <Loader2 className="h-6 w-6 animate-spin text-brand-blue" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Topic</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Requested At</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {requests.length === 0 ? (
                  <tr><td colSpan="4" className="p-8 text-center text-slate-500">No requests found.</td></tr>
                ) : (
                  requests.map(req => (
                    <tr key={req.id}>
                      <td className="px-4 py-4 text-sm font-semibold text-slate-900">{req.topic}</td>
                      <td className="px-4 py-4 text-sm text-slate-600">{formatDate(req.requested_at)}</td>
                      <td className="px-4 py-4 text-sm">
                        <select
                          value={req.status}
                          disabled={busyId === req.id}
                          onChange={(e) => updateStatus(req.id, e.target.value)}
                          className="rounded border border-slate-300 py-1 pl-2 pr-8 text-sm focus:border-brand-accent focus:ring-1 focus:ring-brand-accent"
                        >
                          <option value="pending">Pending</option>
                          <option value="uploaded">Uploaded</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => handleDelete(req.id)}
                          disabled={busyId === req.id}
                          className="text-red-600 hover:text-red-800 disabled:opacity-50"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
