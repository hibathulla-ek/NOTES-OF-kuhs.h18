import { useEffect, useRef, useState, useCallback } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import {
  AlertCircle,
  ArrowUp,
  ExternalLink,
  Loader2,
  Maximize2,
  Minimize2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  FileText
} from 'lucide-react'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { extractGoogleDriveFileId, getGoogleDriveEmbedUrl } from '../lib/driveEmbed'

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

export default function NativePdfViewer({
  fileId,
  driveUrl,
  title = 'Document',
  maxHeight = 'max-h-[85vh]',
  showToolbar = true,
  fallbackIframe = true,
}) {
  const resolvedFileId = fileId || extractGoogleDriveFileId(driveUrl)
  const [numPages, setNumPages] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [zoomScale, setZoomScale] = useState(1.0)
  const [containerWidth, setContainerWidth] = useState(800)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [pdfError, setPdfError] = useState(false)
  const [useIframeFallback, setUseIframeFallback] = useState(false)

  const viewerContainerRef = useRef(null)
  const scrollContainerRef = useRef(null)
  const initialTouchDistanceRef = useRef(null)
  const initialZoomRef = useRef(1.0)

  // Measure container width for responsive auto-fit
  useEffect(() => {
    if (!scrollContainerRef.current) return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(entry.contentRect.width)
        }
      }
    })

    observer.observe(scrollContainerRef.current)
    return () => observer.disconnect()
  }, [])

  // Track scroll position for Page Indicator & Scroll-to-Top button
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return
    const container = scrollContainerRef.current
    const scrollTop = container.scrollTop

    setShowScrollTop(scrollTop > 400)

    // Calculate active page based on scroll height and number of pages
    if (numPages && container.scrollHeight > 0) {
      const pageHeight = container.scrollHeight / numPages
      const pageIndex = Math.min(
        Math.max(Math.floor((scrollTop + container.clientHeight / 3) / pageHeight) + 1, 1),
        numPages
      )
      setCurrentPage(pageIndex)
    }
  }, [numPages])

  // Pinch-to-zoom touch handlers
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      initialTouchDistanceRef.current = distance
      initialZoomRef.current = zoomScale
    }
  }

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && initialTouchDistanceRef.current) {
      const currentDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      const scaleFactor = currentDistance / initialTouchDistanceRef.current
      const newZoom = Math.min(Math.max(initialZoomRef.current * scaleFactor, 0.75), 2.5)
      setZoomScale(Number(newZoom.toFixed(2)))
    }
  }

  const handleTouchEnd = () => {
    initialTouchDistanceRef.current = null
  }

  // Full screen toggle
  const toggleFullScreen = () => {
    if (!viewerContainerRef.current) return

    if (!document.fullscreenElement) {
      viewerContainerRef.current
        .requestFullscreen?.()
        .then(() => setIsFullScreen(true))
        .catch(() => setIsFullScreen(true))
    } else {
      document
        .exitFullscreen?.()
        .then(() => setIsFullScreen(false))
        .catch(() => setIsFullScreen(false))
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(Boolean(document.fullscreenElement))
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Dynamic Page Width calculation
  const pageWidth =
    containerWidth < 640
      ? Math.max(containerWidth - 16, 280)
      : containerWidth >= 1024
      ? Math.min(containerWidth - 48, 880)
      : Math.min(containerWidth - 32, 740)

  const pdfUrl = resolvedFileId ? `/api/pdf-proxy?fileId=${encodeURIComponent(resolvedFileId)}` : null
  const embedUrl = getGoogleDriveEmbedUrl(
    driveUrl || (resolvedFileId ? `https://drive.google.com/file/d/${resolvedFileId}/view` : '')
  )

  const handleLoadError = () => {
    setPdfError(true)
    if (fallbackIframe && embedUrl) {
      setUseIframeFallback(true)
    }
  }

  if (!resolvedFileId && !driveUrl) {
    return (
      <div className="flex h-64 w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center shadow-inner">
        <FileText className="h-8 w-8 text-slate-400" aria-hidden="true" />
        <p className="mt-2 text-sm font-semibold text-slate-700">No document attached to this note.</p>
      </div>
    )
  }

  // Automatic or manual fallback to embedded Google Drive preview
  if (useIframeFallback && embedUrl) {
    return (
      <div
        ref={viewerContainerRef}
        className={`relative flex flex-col w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden ${
          isFullScreen ? 'fixed inset-0 z-50 h-screen rounded-none' : ''
        }`}
      >
        {showToolbar ? (
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 sm:px-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded bg-white px-2 py-0.5 text-slate-700 shadow-sm border border-slate-200">
                <FileText className="h-3.5 w-3.5 text-brand-blue" aria-hidden="true" />
                Google Drive Viewer
              </span>
              {!pdfError ? (
                <button
                  type="button"
                  onClick={() => setUseIframeFallback(false)}
                  className="text-brand-blue hover:underline focus:outline-none"
                >
                  Switch to Native Viewer
                </button>
              ) : null}
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={toggleFullScreen}
                className="rounded p-1 text-slate-600 hover:bg-slate-200 hover:text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-accent"
                title={isFullScreen ? 'Exit Full Screen' : 'Full Screen Mode'}
                aria-label="Toggle Fullscreen"
              >
                {isFullScreen ? (
                  <Minimize2 className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Maximize2 className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
              {driveUrl ? (
                <a
                  href={driveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded bg-brand-blue px-2.5 py-1 text-xs font-semibold text-white hover:bg-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
                >
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  Open in Drive
                </a>
              ) : null}
            </div>
          </div>
        ) : null}

        <iframe
          src={embedUrl}
          title={`Preview - ${title}`}
          className={`w-full ${isFullScreen ? 'h-[calc(100vh-2.75rem)]' : 'h-[75vh]'} border-0`}
          allow="autoplay"
        />
      </div>
    )
  }

  return (
    <div
      ref={viewerContainerRef}
      className={`relative flex flex-col w-full rounded-xl border border-slate-200 bg-slate-900 shadow-lg overflow-hidden ${
        isFullScreen ? 'fixed inset-0 z-50 h-screen rounded-none' : ''
      }`}
    >
      {/* Top Floating Control Bar */}
      {showToolbar ? (
        <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-900/95 px-3 py-2 text-white backdrop-blur-sm sm:px-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <span className="inline-flex items-center gap-1.5 rounded bg-slate-800 px-2.5 py-1 text-slate-200">
              <FileText className="h-3.5 w-3.5 text-brand-light" aria-hidden="true" />
              {numPages ? (
                <span>
                  Page <strong className="text-white">{currentPage}</strong> of {numPages}
                </span>
              ) : (
                <span>Loading pages...</span>
              )}
            </span>
          </div>

          {/* Zoom & View Controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setZoomScale((prev) => Math.max(Number((prev - 0.15).toFixed(2)), 0.6))}
              className="rounded p-1.5 text-slate-300 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-1 focus:ring-brand-accent"
              title="Zoom Out"
              aria-label="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" aria-hidden="true" />
            </button>

            <span className="min-w-12 text-center text-xs font-bold text-slate-200">
              {Math.round(zoomScale * 100)}%
            </span>

            <button
              type="button"
              onClick={() => setZoomScale((prev) => Math.min(Number((prev + 0.15).toFixed(2)), 2.5))}
              className="rounded p-1.5 text-slate-300 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-1 focus:ring-brand-accent"
              title="Zoom In"
              aria-label="Zoom In"
            >
              <ZoomIn className="h-4 w-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => setZoomScale(1.0)}
              className="hidden sm:inline-flex items-center gap-1 rounded bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white focus:outline-none focus:ring-1 focus:ring-brand-accent"
              title="Fit to Width"
            >
              <RotateCcw className="h-3 w-3" aria-hidden="true" />
              Fit Width
            </button>

            <div className="h-4 w-px bg-slate-700 mx-1" />

            <button
              type="button"
              onClick={toggleFullScreen}
              className="rounded p-1.5 text-slate-300 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-1 focus:ring-brand-accent"
              title={isFullScreen ? 'Exit Full Screen' : 'Full Screen Mode'}
              aria-label="Toggle Fullscreen"
            >
              {isFullScreen ? (
                <Minimize2 className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Maximize2 className="h-4 w-4" aria-hidden="true" />
              )}
            </button>

            {driveUrl ? (
              <a
                href={driveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:inline-flex items-center gap-1 rounded bg-brand-blue px-2.5 py-1 text-xs font-semibold text-white hover:bg-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
                title="Open directly in Google Drive"
              >
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
                Drive
              </a>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Main Continuous Scroll Area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`relative flex flex-col items-center gap-6 overflow-y-auto w-full ${
          isFullScreen ? 'h-[calc(100vh-3.5rem)]' : maxHeight
        } p-2 sm:p-4 md:p-6 bg-slate-950/90 touch-pan-y`}
      >
        {pdfError && !useIframeFallback ? (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-900 rounded-xl border border-slate-800 max-w-lg my-8 text-white">
            <div className="rounded-full bg-amber-500/10 p-3 text-amber-400">
              <AlertCircle className="h-8 w-8" aria-hidden="true" />
            </div>
            <h3 className="mt-3 text-base font-bold">Unable to render PDF stream</h3>
            <p className="mt-1 text-xs text-slate-400">
              The document might be restricted by Google Drive permissions or is not a direct PDF file.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 justify-center">
              {fallbackIframe && embedUrl ? (
                <button
                  type="button"
                  onClick={() => setUseIframeFallback(true)}
                  className="rounded-md bg-brand-blue px-4 py-2 text-xs font-bold text-white shadow hover:bg-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent"
                >
                  Use Google Drive Viewer
                </button>
              ) : null}
              {driveUrl ? (
                <a
                  href={driveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-md bg-slate-800 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700"
                >
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  Open in New Tab
                </a>
              ) : null}
            </div>
          </div>
        ) : (
          <Document
            file={pdfUrl}
            onLoadSuccess={({ numPages: total }) => {
              setNumPages(total)
              setPdfError(false)
            }}
            onLoadError={handleLoadError}
            loading={
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Loader2 className="h-10 w-10 animate-spin text-brand-accent" aria-hidden="true" />
                <p className="mt-4 text-sm font-semibold tracking-wide text-slate-200">
                  Loading study note...
                </p>
                <span className="mt-1 text-xs text-slate-500">Preparing high-resolution pages</span>
              </div>
            }
          >
            {Array.from(new Array(numPages || 0), (_, index) => {
              const pageNum = index + 1
              return (
                <div
                  key={`page_${pageNum}`}
                  className="relative overflow-hidden rounded-lg bg-white shadow-2xl transition-transform duration-150 mb-4"
                >
                  <Page
                    pageNumber={pageNum}
                    width={pageWidth}
                    scale={zoomScale}
                    renderTextLayer={true}
                    renderAnnotationLayer={false}
                    loading={
                      <div className="flex min-h-96 min-w-72 items-center justify-center bg-white text-slate-400 animate-pulse">
                        <span className="text-xs font-semibold">Loading page {pageNum}...</span>
                      </div>
                    }
                  />
                  <div className="absolute bottom-2 right-2 rounded bg-slate-900/60 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm pointer-events-none">
                    {pageNum}
                  </div>
                </div>
              )
            })}
          </Document>
        )}

        {/* Scroll To Top Button */}
        {showScrollTop ? (
          <button
            type="button"
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-brand-blue text-white shadow-xl transition hover:bg-brand-accent hover:scale-105 focus:outline-none focus:ring-2 focus:ring-brand-accent"
            title="Scroll to top"
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-5 w-5" aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </div>
  )
}
