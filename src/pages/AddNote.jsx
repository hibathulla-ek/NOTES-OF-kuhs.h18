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

  async function isDuplicateNote(noteData) {
    try {
      const data = await adminRequest('/api/admin/notes', { password: adminPassword })
      const existingNotes = data.notes ?? []
      const normalizedUrl = noteData.drive_url.trim().toLowerCase()
      const normalizedTitle = noteData.title.trim().toLowerCase()

      return existingNotes.some(
        (existingNote) =>
          existingNote.drive_url?.trim().toLowerCase() === normalizedUrl ||
          existingNote.title?.trim().toLowerCase() === normalizedTitle,
      )
    } catch {
      return false
    }
  }

  async function handleSubmit(noteData) {
    if (await isDuplicateNote(noteData)) {
      const confirmed = window.confirm(
        'A note with a matching title or Google Drive link already exists. Add it anyway?',
      )

      if (!confirmed) {
        return
      }
    }

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
