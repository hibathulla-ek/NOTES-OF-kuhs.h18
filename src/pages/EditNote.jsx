import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'
import NoteForm from '../components/NoteForm'
import { useAdminAuth } from '../context/AdminAuth'
import { adminRequest } from '../lib/adminApi'

export default function EditNote() {
  const { id } = useParams()
  const { adminPassword } = useAdminAuth()
  const navigate = useNavigate()
  const [note, setNote] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = 'Admin — KUHS MLT Notes'
  }, [])

  useEffect(() => {
    let isCurrent = true

    async function loadNote() {
      setIsLoading(true)
      setError('')

      try {
        const data = await adminRequest(`/api/admin/notes/${id}`, { password: adminPassword })

        if (isCurrent) {
          setNote(data.note)
        }
      } catch (editError) {
        if (isCurrent) {
          setError(editError.message || 'Unable to load note.')
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

  async function handleSubmit(noteData) {
    setIsSubmitting(true)

    try {
      await adminRequest(`/api/admin/notes/${id}`, {
        method: 'PATCH',
        password: adminPassword,
        body: noteData,
      })

      toast.success('Note updated')
      navigate('/admin/dashboard')
    } catch (updateError) {
      toast.error(updateError.message || 'Unable to update note.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center text-brand-blue">
        <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
        <span className="ml-2 text-sm font-semibold">Loading note</span>
      </div>
    )
  }

  if (error) {
    return <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-brand-blue">Edit Note</h1>
        <p className="mt-2 text-sm text-slate-600">Update note details and visibility.</p>
      </div>
      <NoteForm initialValues={note} onSubmit={handleSubmit} submitLabel="Update Note" isSubmitting={isSubmitting} />
    </div>
  )
}
