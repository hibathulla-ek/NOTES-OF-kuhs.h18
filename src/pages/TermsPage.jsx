import { useEffect } from 'react'

export default function TermsPage() {
  useEffect(() => {
    document.title = 'Terms & Conditions — KUHS MLT Notes'
  }, [])

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-12 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-bold text-brand-blue">Terms & Conditions</h1>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-950">1. About this site</h2>
          <p className="text-sm leading-6 text-slate-600">
            KUHS BSc MLT Notes Portal is a free, student-run resource that indexes study notes, question banks, and
            MCQ practice material for the KUHS BSc Medical Laboratory Technology syllabus. Notes are hosted on
            Google Drive and linked from this site; we do not host the files ourselves.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-950">2. Educational use only</h2>
          <p className="text-sm leading-6 text-slate-600">
            All content is provided for personal study purposes only. Notes may be contributed or compiled by
            students and are provided "as is" without any warranty of accuracy or completeness. Always cross-check
            against your official syllabus and textbooks before an examination.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-950">3. Fair use & rate limits</h2>
          <p className="text-sm leading-6 text-slate-600">
            To keep downloads available for everyone, we apply a rolling download limit per IP address. Please
            don't attempt to automate or bulk-download content in a way that circumvents this limit.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-950">4. Content requests & takedowns</h2>
          <p className="text-sm leading-6 text-slate-600">
            You can request a topic you can't find using the "Request a note" form on the home page. If you believe
            content on this site infringes your copyright, please reach out through our social channels linked in
            the footer and we will review and remove it promptly.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-950">5. Changes to these terms</h2>
          <p className="text-sm leading-6 text-slate-600">
            We may update these terms occasionally as the site evolves. Continued use of the site after changes
            means you accept the updated terms.
          </p>
        </section>
      </div>
    </main>
  )
}
