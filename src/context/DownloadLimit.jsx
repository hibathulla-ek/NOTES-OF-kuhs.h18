import { createContext, useContext, useState, useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

const DownloadLimitContext = createContext(null)

export function DownloadLimitProvider({ children }) {
  const [isLimitReached, setIsLimitReached] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const checkLimitStatus = async () => {
    try {
      const res = await fetch('/api/download?status=1')
      if (res.ok) {
        const data = await res.json()
        setIsLimitReached(data.limitReached)
      }
    } catch (err) {
      // Silently fail checking status
    }
  }

  useEffect(() => {
    checkLimitStatus()
  }, [])

  const downloadFile = async (id, type) => {
    if (isDownloading) return false
    setIsDownloading(true)
    try {
      const res = await fetch(`/api/download?id=${id}&type=${type}`)
      
      if (res.status === 429) {
        setIsLimitReached(true)
        setShowModal(true)
        setIsDownloading(false)
        return false
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Download failed.')
      }

      const data = await res.json()
      if (data.url) {
        window.open(data.url, '_blank')
        setIsDownloading(false)
        return true
      }
      
      throw new Error('No download URL returned.')
    } catch (err) {
      toast.error(err.message || 'Unable to open file.')
      setIsDownloading(false)
      return false
    }
  }

  return (
    <DownloadLimitContext.Provider value={{ isLimitReached, downloadFile, showModal, setShowModal }}>
      {children}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md transform overflow-hidden rounded-xl bg-white p-6 shadow-2xl transition-all border border-slate-100">
            <div className="flex items-center justify-center mx-auto h-12 w-12 rounded-full bg-amber-50 text-amber-600 mb-4">
              <AlertTriangle className="h-6 w-6" aria-hidden="true" />
            </div>
            <h3 className="text-center text-lg font-bold leading-6 text-slate-950">
              Download Limit Reached
            </h3>
            <p className="mt-3 text-center text-sm leading-6 text-slate-600">
              You've reached your daily download limit. To ensure fair access for all students, you can download more notes after 24 hours. Thank you for your understanding!
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="inline-flex w-full justify-center rounded-md bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2"
              >
                Got it, thanks!
              </button>
            </div>
          </div>
        </div>
      )}
    </DownloadLimitContext.Provider>
  )
}

export function useDownloadLimit() {
  const context = useContext(DownloadLimitContext)
  if (!context) {
    throw new Error('useDownloadLimit must be used within DownloadLimitProvider')
  }
  return context
}
