import { Link, Route, Routes, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import { supabase } from './lib/supabase'
import AdminLayout from './components/AdminLayout'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AddNote from './pages/AddNote'
import AdminDashboard from './pages/AdminDashboard'
import AdminLogin from './pages/AdminLogin'
import EditNote from './pages/EditNote'
import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import QuestionBankPage from './pages/QuestionBankPage'
import MCQPage from './pages/MCQPage'
import NoteRequests from './pages/NoteRequests'
import AdminQuestions from './pages/AdminQuestions'
import AddQuestion from './pages/AddQuestion'
import EditQuestion from './pages/EditQuestion'
import AdminMCQ from './pages/AdminMCQ'
import AddMCQ from './pages/AddMCQ'
import EditMCQ from './pages/EditMCQ'
import MCQSettings from './pages/MCQSettings'
import TermsPage from './pages/TermsPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'

function PlaceholderPage({ children }) {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-12 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-lg border border-slate-200 bg-white p-6 text-lg font-semibold text-brand-blue shadow-sm">
        {children}
      </div>
    </main>
  )
}

function NotFoundPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-16 text-center text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md">
        <h1 className="text-3xl font-bold text-brand-blue">Page not found</h1>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-md bg-brand-blue px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2"
        >
          Back to Home
        </Link>
      </div>
    </main>
  )
}

export default function App() {
  const location = useLocation()

  useEffect(() => {
    async function trackView() {
      if (supabase) {
        try {
          await supabase.from('site_views').insert([{ page: location.pathname }])
        } catch (error) {
          // Silently fail
        }
      }
    }
    trackView()
  }, [location.pathname])

  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/questions" element={<QuestionBankPage />} />
        <Route path="/mcq" element={<MCQPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="new" element={<AddNote />} />
          <Route path="edit/:id" element={<EditNote />} />
          <Route path="requests" element={<NoteRequests />} />
          <Route path="questions" element={<AdminQuestions />} />
          <Route path="questions/new" element={<AddQuestion />} />
          <Route path="questions/edit/:id" element={<EditQuestion />} />
          <Route path="mcq" element={<AdminMCQ />} />
          <Route path="mcq/new" element={<AddMCQ />} />
          <Route path="mcq/edit/:id" element={<EditMCQ />} />
          <Route path="mcq/settings" element={<MCQSettings />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      {isAdminRoute ? null : <Footer />}
      <Toaster position="top-right" />
    </>
  )
}
