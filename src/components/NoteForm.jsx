import { Loader2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { PAPERS, SUBJECTS, YEARS } from '../lib/constants'

const emptyForm = {
  title: '',
  subject: SUBJECTS[0],
  year: YEARS[0],
  paper: PAPERS[0],
  keywords: [],
  description: '',
  drive_url: '',
  is_active: true,
}

function normalizeKeyword(value) {
  return value.trim().replace(/\s+/g, ' ')
}

export default function NoteForm({ initialValues, onSubmit, submitLabel = 'Save Note', isSubmitting = false }) {
  const [formData, setFormData] = useState({ ...emptyForm, ...initialValues })
  const [keywordInput, setKeywordInput] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setFormData({ ...emptyForm, ...initialValues, keywords: initialValues?.keywords ?? [] })
  }, [initialValues])

  function updateField(name, value) {
    setFormData((currentData) => ({ ...currentData, [name]: value }))
    setErrors((currentErrors) => ({ ...currentErrors, [name]: '' }))
  }

  function addKeywords(rawValue) {
    const nextKeywords = rawValue
      .split(',')
      .map(normalizeKeyword)
      .filter(Boolean)

    if (nextKeywords.length === 0) {
      return
    }

    setFormData((currentData) => {
      const existing = new Set(currentData.keywords.map((keyword) => keyword.toLowerCase()))
      const mergedKeywords = [...currentData.keywords]

      nextKeywords.forEach((keyword) => {
        if (!existing.has(keyword.toLowerCase())) {
          existing.add(keyword.toLowerCase())
          mergedKeywords.push(keyword)
        }
      })

      return { ...currentData, keywords: mergedKeywords }
    })
    setKeywordInput('')
  }

  function removeKeyword(keywordToRemove) {
    setFormData((currentData) => ({
      ...currentData,
      keywords: currentData.keywords.filter((keyword) => keyword !== keywordToRemove),
    }))
  }

  function handleKeywordChange(event) {
    const nextValue = event.target.value

    if (nextValue.includes(',')) {
      addKeywords(nextValue)
    } else {
      setKeywordInput(nextValue)
    }
  }

  function handleKeywordKeyDown(event) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      addKeywords(keywordInput)
    }
  }

  function validateForm() {
    const nextErrors = {}

    if (!formData.title.trim()) {
      nextErrors.title = 'Title is required.'
    }

    if (!formData.drive_url.trim()) {
      nextErrors.drive_url = 'Google Drive URL is required.'
    } else if (!formData.drive_url.trim().startsWith('https://drive.google.com')) {
      nextErrors.drive_url = 'Google Drive URL must start with https://drive.google.com'
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
      keywords: formData.keywords,
      description: formData.description.trim(),
      drive_url: formData.drive_url.trim(),
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

      <div>
        <label htmlFor="keywords" className="text-sm font-semibold text-slate-700">
          Keywords
        </label>
        <input
          id="keywords"
          type="text"
          value={keywordInput}
          onChange={handleKeywordChange}
          onKeyDown={handleKeywordKeyDown}
          onBlur={() => addKeywords(keywordInput)}
          placeholder="Type keyword and press Enter or comma"
          className="mt-2 w-full rounded-md border border-slate-200 px-3 py-3 text-base text-slate-950 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
        />
        {formData.keywords.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {formData.keywords.map((keyword) => (
              <button
                key={keyword}
                type="button"
                onClick={() => removeKeyword(keyword)}
                className="inline-flex items-center gap-2 rounded-full bg-brand-light px-3 py-1.5 text-sm font-semibold text-brand-blue hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-brand-accent"
              >
                {keyword}
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div>
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="description" className="text-sm font-semibold text-slate-700">
            Description
          </label>
          <span className="text-xs font-semibold text-slate-500">{formData.description.length}/200</span>
        </div>
        <textarea
          id="description"
          value={formData.description}
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
