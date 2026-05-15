import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { PAPERS, SUBJECTS, YEARS } from '../lib/constants'

const emptyForm = {
  title: '',
  subject: SUBJECTS[0],
  year: YEARS[0],
  paper: PAPERS[0],
  type: 'Question Bank',
  exam_year: '',
  description: '',
  drive_url: '',
  is_active: true,
}

function normalizeDriveUrl(value) {
  return value.trim().replace(/\s+/g, '')
}

function isGoogleDriveUrl(value) {
  try {
    const parsedUrl = new URL(normalizeDriveUrl(value))
    return parsedUrl.protocol === 'https:' && parsedUrl.hostname === 'drive.google.com'
  } catch {
    return false
  }
}

export default function QuestionForm({ initialValues, onSubmit, submitLabel = 'Save Question', isSubmitting = false }) {
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

    if (!formData.title.trim()) {
      nextErrors.title = 'Title is required.'
    }

    if (!formData.drive_url.trim()) {
      nextErrors.drive_url = 'Google Drive URL is required.'
    } else if (!isGoogleDriveUrl(formData.drive_url)) {
      nextErrors.drive_url = 'Google Drive URL must start with https://drive.google.com'
    }

    if (formData.type === 'PYQ' && !formData.exam_year?.trim()) {
      nextErrors.exam_year = 'Exam Year is required for PYQ.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    await onSubmit({
      title: formData.title.trim(),
      subject: formData.subject,
      year: formData.year,
      paper: formData.paper,
      type: formData.type,
      exam_year: formData.type === 'PYQ' ? formData.exam_year?.trim() : null,
      description: formData.description?.trim() || null,
      drive_url: normalizeDriveUrl(formData.drive_url),
      is_active: formData.is_active,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <label htmlFor="title" className="text-sm font-semibold text-slate-700">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(event) => updateField('title', event.target.value)}
          required
          className="mt-2 w-full rounded-md border border-slate-200 px-3 py-3 text-base text-slate-950 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
        />
        {errors.title ? <p className="mt-1 text-sm font-semibold text-red-700">{errors.title}</p> : null}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Subject</span>
          <select
            value={formData.subject}
            onChange={(event) => updateField('subject', event.target.value)}
            className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
          >
            {SUBJECTS.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Year</span>
          <select
            value={formData.year}
            onChange={(event) => updateField('year', event.target.value)}
            className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
          >
            {YEARS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Paper</span>
          <select
            value={formData.paper}
            onChange={(event) => updateField('paper', event.target.value)}
            className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
          >
            {PAPERS.map((paper) => (
              <option key={paper} value={paper}>
                {paper}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2 items-start">
        <div className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">Type</span>
          <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <label className="flex items-center gap-3">
              <input
                type="radio"
                name="type"
                value="Question Bank"
                checked={formData.type === 'Question Bank'}
                onChange={(e) => updateField('type', e.target.value)}
                className="h-4 w-4 text-brand-blue focus:ring-brand-accent"
              />
              <span className="text-sm font-medium text-slate-900">Question Bank</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="radio"
                name="type"
                value="PYQ"
                checked={formData.type === 'PYQ'}
                onChange={(e) => updateField('type', e.target.value)}
                className="h-4 w-4 text-brand-blue focus:ring-brand-accent"
              />
              <span className="text-sm font-medium text-slate-900">Previous Year Questions (PYQ)</span>
            </label>
          </div>
        </div>

        {formData.type === 'PYQ' && (
          <div>
            <label htmlFor="exam_year" className="text-sm font-semibold text-slate-700">
              Exam Year
            </label>
            <input
              id="exam_year"
              type="text"
              value={formData.exam_year || ''}
              onChange={(event) => updateField('exam_year', event.target.value)}
              placeholder="e.g. 2023"
              className="mt-2 w-full rounded-md border border-slate-200 px-3 py-3 text-base text-slate-950 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
            />
            {errors.exam_year && <p className="mt-1 text-sm font-semibold text-red-700">{errors.exam_year}</p>}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="description" className="text-sm font-semibold text-slate-700">
            Description
          </label>
          <span className="text-xs font-semibold text-slate-500">{(formData.description || '').length}/200</span>
        </div>
        <textarea
          id="description"
          value={formData.description || ''}
          onChange={(event) => updateField('description', event.target.value)}
          maxLength={200}
          rows={4}
          className="mt-2 w-full rounded-md border border-slate-200 px-3 py-3 text-base text-slate-950 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
        />
      </div>

      <div>
        <label htmlFor="drive_url" className="text-sm font-semibold text-slate-700">
          Google Drive URL
        </label>
        <input
          id="drive_url"
          type="url"
          value={formData.drive_url}
          onChange={(event) => updateField('drive_url', event.target.value)}
          required
          placeholder="https://drive.google.com/..."
          className="mt-2 w-full rounded-md border border-slate-200 px-3 py-3 text-base text-slate-950 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
        />
        {errors.drive_url ? <p className="mt-1 text-sm font-semibold text-red-700">{errors.drive_url}</p> : null}
      </div>

      <label className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <span>
          <span className="block text-sm font-semibold text-slate-700">Active</span>
          <span className="block text-xs font-medium text-slate-500">Visible on the public site</span>
        </span>
        <input
          type="checkbox"
          checked={formData.is_active}
          onChange={(event) => updateField('is_active', event.target.checked)}
          className="h-5 w-5 rounded border-slate-300 text-brand-blue focus:ring-brand-accent"
        />
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand-blue px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
      >
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
        {submitLabel}
      </button>
    </form>
  )
}
