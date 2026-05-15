import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'
import QuestionForm from '../components/QuestionForm'
import { useAdminAuth } from '../context/AdminAuth'
import { adminRequest } from '../lib/adminApi'

export default function EditQuestion() {
  const { id } = useParams()
  const { adminPassword } = useAdminAuth()
  const navigate = useNavigate()
  const [question, setQuestion] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadQuestion() {
      try {
        const data = await adminRequest(`/api/admin/question?id=${id}`, { password: adminPassword })
        setQuestion(data.question)
      } catch (err) {
        setError(err.message || 'Unable to load question.')
      } finally {
        setIsLoading(false)
      }
    }
    loadQuestion()
  }, [id, adminPassword])

  async function handleSubmit(data) {
    setIsSubmitting(true)
    try {
      await adminRequest(`/api/admin/question?id=${id}`, { method: 'PATCH', password: adminPassword, body: data })
      toast.success('Question updated')
      navigate('/admin/questions')
    } catch (err) {
      toast.error('Unable to update question.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm">
        <Loader2 className="h-6 w-6 animate-spin text-brand-blue" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-brand-blue">Edit Question</h1>
      </div>
      <QuestionForm initialValues={question} onSubmit={handleSubmit} submitLabel="Update Question" isSubmitting={isSubmitting} />
    </div>
  )
}
