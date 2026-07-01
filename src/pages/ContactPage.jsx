import { Mail } from 'lucide-react'
import { useEffect } from 'react'

const CONTACT_EMAIL = 'brightpath18@gmail.com'

export default function ContactPage() {
  useEffect(() => {
    document.title = 'Contact Us — KUHS MLT Notes'
  }, [])

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-12 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-bold text-brand-blue">Contact Us</h1>

        <p className="text-sm leading-6 text-slate-600">
          Have a question, found an issue, or want to contribute notes? Reach out and we'll get back to you.
        </p>

        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="inline-flex items-center gap-3 rounded-lg border border-slate-200 bg-brand-light px-4 py-3 text-sm font-semibold text-brand-blue transition hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2"
        >
          <Mail className="h-5 w-5" aria-hidden="true" />
          {CONTACT_EMAIL}
        </a>

        <p className="text-xs font-medium text-slate-500">
          You can also request a specific note topic from the home page, or reach us on Telegram via the link in the
          footer.
        </p>
      </div>
    </main>
  )
}
