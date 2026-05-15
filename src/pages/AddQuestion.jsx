import { useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import QuestionForm from '../components/QuestionForm'
import { useAdminAuth } from '../context/AdminAuth'
import { adminRequest } from '../lib/adminApi'

export default function AddQuestion() {
  const { adminPassword } = useAdminAuth()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(data) {
    setIsSubmitting(true)
    try {
      await adminRequest('/api/admin/questions', { method: 'POST', password: adminPassword, body: data })
      toast.success('Question added')
      navigate('/admin/questions')
    } catch (err) {
      toast.error('Unable to add question.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-brand-blue">Add Question</h1>
      </div>
      <QuestionForm onSubmit={handleSubmit} submitLabel="Add Question" isSubmitting={isSubmitting} />
    </div>
  )
}
