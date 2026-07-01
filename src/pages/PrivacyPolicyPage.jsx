import { useEffect } from 'react'

export default function PrivacyPolicyPage() {
  useEffect(() => {
    document.title = 'Privacy Policy — KUHS MLT Notes'
  }, [])

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-12 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-bold text-brand-blue">Privacy Policy</h1>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-950">1. No accounts, no personal data</h2>
          <p className="text-sm leading-6 text-slate-600">
            This site does not require you to create an account and does not knowingly collect names, emails, or
            other personal information from visitors browsing or downloading notes.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-950">2. Basic usage analytics</h2>
          <p className="text-sm leading-6 text-slate-600">
            We record anonymous page-view events (the page path and timestamp) to understand which subjects and
            papers are most used, so we can prioritise what to upload next. These records are not linked to any
            personal identity.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-950">3. Download rate limiting</h2>
          <p className="text-sm leading-6 text-slate-600">
            To keep the site fair and available for everyone, we log the requesting IP address and a timestamp each
            time a file is downloaded, and use this to apply a rolling download limit. These logs are used solely
            for abuse prevention and are not shared with third parties.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-950">4. Note requests</h2>
          <p className="text-sm leading-6 text-slate-600">
            If you submit a topic through the "Request a note" form, we store the topic text so we can act on it.
            Please avoid including personal information in your request.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-950">5. Third-party links</h2>
          <p className="text-sm leading-6 text-slate-600">
            Notes are hosted on Google Drive; downloading a file takes you to Google's platform, which has its own
            privacy policy. We are not responsible for how third-party services handle your data.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-950">6. Changes to this policy</h2>
          <p className="text-sm leading-6 text-slate-600">
            We may update this policy as the site evolves. Continued use of the site after changes means you accept
            the updated policy.
          </p>
        </section>
      </div>
    </main>
  )
}
