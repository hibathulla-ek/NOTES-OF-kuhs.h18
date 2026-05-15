import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { PAPERS, SUBJECTS, YEARS } from '../lib/constants'

const emptyForm = {
  question: '',
  subject: SUBJECTS[0],
  year: YEARS[0],
  paper: PAPERS[0],
  option_a: '',
  option_b: '',
  option_c: '',
  option_d: '',
  correct_option: 'A',
  explanation: '',
  is_active: true,
}

export default function MCQForm({ initialValues, onSubmit, submitLabel = 'Save MCQ', isSubmitting = false }) {
  const [formData, setFormData] = useState({ ...emptyForm, ...initialValues })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setFormData({ ...emptyForm, ...initialValues })
  }, [initialValues])

  function updateField(name, value) {
    setFormData((currentData) => ({ ...currentData, [name]: value }))
    setErrors((currentErrors) => ({ ...currentErrors, [name]: '' }))
  }

  function validateForm() {
    const nextErrors = {}
    if (!formData.question.trim()) nextErrors.question = 'Question is required.'
    if (!formData.option_a.trim()) nextErrors.option_a = 'Option A is required.'
    if (!formData.option_b.trim()) nextErrors.option_b = 'Option B is required.'
    if (!formData.option_c.trim()) nextErrors.option_c = 'Option C is required.'
    if (!formData.option_d.trim()) nextErrors.option_d = 'Option D is required.'

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!validateForm()) return

    await onSubmit({
      question: formData.question.trim(),
      subject: formData.subject,
      year: formData.year,
      paper: formData.paper,
      option_a: formData.option_a.trim(),
      option_b: formData.option_b.trim(),
      option_c: formData.option_c.trim(),
      option_d: formData.option_d.trim(),
      correct_option: formData.correct_option,
      explanation: formData.explanation?.trim() || null,
      is_active: formData.is_active,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <label htmlFor="question" className="text-sm font-semibold text-slate-700">Question</label>
        <textarea
          id="question"
          value={formData.question}
          onChange={(event) => updateField('question', event.target.value)}
          required
          rows={3}
          className="mt-2 w-full rounded-md border border-slate-200 px-3 py-3 text-base text-slate-950 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
        />
        {errors.question && <p className="mt-1 text-sm font-semibold text-red-700">{errors.question}</p>}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Subject</span>
          <select value={formData.subject} onChange={(e) => updateField('subject', e.target.value)} className="mt-2 w-full rounded-md border border-slate-200 px-3 py-3 text-sm font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-accent">
            {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Year</span>
          <select value={formData.year} onChange={(e) => updateField('year', e.target.value)} className="mt-2 w-full rounded-md border border-slate-200 px-3 py-3 text-sm font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-accent">
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Paper</span>
          <select value={formData.paper} onChange={(e) => updateField('paper', e.target.value)} className="mt-2 w-full rounded-md border border-slate-200 px-3 py-3 text-sm font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-accent">
            {PAPERS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {['A', 'B', 'C', 'D'].map((opt) => (
          <div key={opt}>
            <label className="text-sm font-semibold text-slate-700">Option {opt}</label>
            <input
              type="text"
              value={formData[`option_${opt.toLowerCase()}`]}
              onChange={(e) => updateField(`option_${opt.toLowerCase()}`, e.target.value)}
              required
              className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
            />
            {errors[`option_${opt.toLowerCase()}`] && <p className="mt-1 text-xs font-semibold text-red-700">{errors[`option_${opt.toLowerCase()}`]}</p>}
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">Correct Answer</span>
        <div className="flex flex-wrap gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          {['A', 'B', 'C', 'D'].map((opt) => (
            <label key={opt} className="flex items-center gap-2">
              <input
                type="radio"
                name="correct_option"
                value={opt}
                checked={formData.correct_option === opt}
                onChange={(e) => updateField('correct_option', e.target.value)}
                className="h-4 w-4 text-brand-blue focus:ring-brand-accent"
              />
              <span className="text-sm font-medium text-slate-900">Option {opt}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="explanation" className="text-sm font-semibold text-slate-700">Explanation (Optional)</label>
        <textarea
          id="explanation"
          value={formData.explanation || ''}
          onChange={(event) => updateField('explanation', event.target.value)}
          rows={3}
          className="mt-2 w-full rounded-md border border-slate-200 px-3 py-3 text-base text-slate-950 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
        />
      </div>

      <label className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <span>
          <span className="block text-sm font-semibold text-slate-700">Active</span>
          <span className="block text-xs font-medium text-slate-500">Available for practice</span>
        </span>
        <input
          type="checkbox"
          checked={formData.is_active}
          onChange={(e) => updateField('is_active', e.target.checked)}
          className="h-5 w-5 rounded border-slate-300 text-brand-blue focus:ring-brand-accent"
        />
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand-blue px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-accent disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitLabel}
      </button>
    </form>
  )
}
