import { useEffect } from 'react'

export default function AboutPage() {
  useEffect(() => {
    document.title = 'About Us — KUHS MLT Notes'
  }, [])

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-12 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-bold text-brand-blue">About Us</h1>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-950">What we do</h2>
          <p className="text-sm leading-6 text-slate-600">
            KUHS BSc MLT Notes Portal is a free, student-run resource that brings together study notes, question
            banks, and MCQ practice material for the KUHS BSc Medical Laboratory Technology syllabus, all in one
            searchable place organised by subject, paper, and year.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-950">Why we built this</h2>
          <p className="text-sm leading-6 text-slate-600">
            Notes for this course are often scattered across group chats and personal drives, and hard to find when
            exams are close. This portal exists to make that material easy to search and download, so students can
            spend less time hunting for notes and more time studying.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-950">Community-driven</h2>
          <p className="text-sm leading-6 text-slate-600">
            Notes are contributed and compiled by students. If you can't find a topic you need, use the "Request a
            note" form on the home page and we'll try to add it. Get in touch via the Contact Us page if you'd like
            to share notes or report an issue.
          </p>
        </section>
      </div>
    </main>
  )
}
