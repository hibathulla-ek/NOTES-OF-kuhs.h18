import { useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import MCQForm from '../components/MCQForm'
import { useAdminAuth } from '../context/AdminAuth'
import { adminRequest } from '../lib/adminApi'

export default function AddMCQ() {
  const { adminPassword } = useAdminAuth()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(data) {
    setIsSubmitting(true)
    try {
      await adminRequest('/api/admin/mcqs', { method: 'POST', password: adminPassword, body: data })
      toast.success('MCQ added')
      navigate('/admin/mcq')
    } catch (err) {
      toast.error('Unable to add MCQ.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-brand-blue">Add MCQ</h1>
      </div>
      <MCQForm onSubmit={handleSubmit} submitLabel="Add MCQ" isSubmitting={isSubmitting} />
    </div>
  )
}
