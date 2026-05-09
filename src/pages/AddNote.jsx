import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import NoteForm from '../components/NoteForm'
import { useAdminAuth } from '../context/AdminAuth'
import { adminRequest } from '../lib/adminApi'

export default function AddNote() {
  const { adminPassword } = useAdminAuth()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    document.title = 'Admin — KUHS MLT Notes'
  }, [])

  async function handleSubmit(noteData) {
    setIsSubmitting(true)

    try {
      await adminRequest('/api/admin/notes', {
        method: 'POST',
        password: adminPassword,
        body: noteData,
      })

      toast.success('Note added')
      navigate('/admin/dashboard')
    } catch (addError) {
      toast.error(addError.message || 'Unable to add note.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-brand-blue">Add Note</h1>
        <p className="mt-2 text-sm text-slate-600">Create a new public or hidden note entry.</p>
      </div>
      <NoteForm onSubmit={handleSubmit} submitLabel="Add Note" isSubmitting={isSubmitting} />
    </div>
  )
}
