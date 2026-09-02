/**
 * Universal Google Document/Slides/Drive Embed URL generator.
 *
 * Supports:
 * 1. Google Slides: https://docs.google.com/presentation/d/ID/...
 * 2. Google Docs: https://docs.google.com/document/d/ID/...
 * 3. Google Drive / PDFs: https://drive.google.com/file/d/ID/... or https://drive.google.com/open?id=ID
 *
 * @param {string} rawUrl - The Google document or drive URL
 * @returns {string} - The embeddable URL
 */
export function getGoogleEmbedUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return ''
  }

  const trimmed = rawUrl.trim()

  // 1. Google Slides
  const slidesMatch = trimmed.match(/docs\.google\.com\/presentation\/d\/([a-zA-Z0-9_-]+)/i)
  if (slidesMatch && slidesMatch[1]) {
    return `https://docs.google.com/presentation/d/${slidesMatch[1]}/embed?start=false&loop=false&delayms=3000`
  }

  // 2. Google Docs
  const docsMatch = trimmed.match(/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/i)
  if (docsMatch && docsMatch[1]) {
    return `https://docs.google.com/document/d/${docsMatch[1]}/preview`
  }

  // 3. Drive File / PDF
  const driveMatch = trimmed.match(/(?:drive\.google\.com\/(?:file\/d\/|open\?id=))([a-zA-Z0-9_-]+)/i)
  if (driveMatch && driveMatch[1]) {
    return `https://drive.google.com/file/d/${driveMatch[1]}/preview`
  }

  // 4. Any other drive.google.com with ?id= or /uc?id=
  const idMatch = trimmed.match(/drive\.google\.com\/.*[?&]id=([a-zA-Z0-9_-]+)/i)
  if (idMatch && idMatch[1]) {
    return `https://drive.google.com/file/d/${idMatch[1]}/preview`
  }

  const fileId = extractGoogleDriveFileId(trimmed)
  if (fileId) {
    return `https://drive.google.com/file/d/${fileId}/preview`
  }

  return trimmed
}

/**
 * Backwards-compatible alias for getGoogleEmbedUrl
 */
export function getGoogleDriveEmbedUrl(url) {
  if (!url || typeof url !== 'string') {
    return null
  }
  const embed = getGoogleEmbedUrl(url)
  return embed || null
}

/**
 * Determines file type from a Google URL.
 * @param {string} rawUrl
 * @returns {'slides'|'docs'|'drive'|'unknown'}
 */
export function getGoogleFileType(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return 'unknown'
  }
  const trimmed = rawUrl.trim()
  if (/docs\.google\.com\/presentation\/d\//i.test(trimmed)) {
    return 'slides'
  }
  if (/docs\.google\.com\/document\/d\//i.test(trimmed)) {
    return 'docs'
  }
  if (/drive\.google\.com\//i.test(trimmed)) {
    return 'drive'
  }
  return 'unknown'
}

/**
 * Validates whether a given URL is a valid Google Docs, Slides, or Drive document URL.
 *
 * Accepts:
 * - https://docs.google.com/presentation/d/* (Google Slides)
 * - https://docs.google.com/document/d/* (Google Docs)
 * - https://drive.google.com/file/d/* (Drive / PDFs)
 * - https://drive.google.com/open?id=*
 *
 * @param {string} value
 * @returns {boolean}
 */
export function isValidGoogleDocumentUrl(value) {
  if (!value || typeof value !== 'string') {
    return false
  }

  const trimmed = value.trim().replace(/\s+/g, '')

  try {
    const parsedUrl = new URL(trimmed)
    if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
      return false
    }

    const validHostnames = ['drive.google.com', 'docs.google.com']
    if (!validHostnames.includes(parsedUrl.hostname)) {
      return false
    }

    if (parsedUrl.hostname === 'docs.google.com') {
      return /\/(?:presentation|document|spreadsheets)\/d\/[a-zA-Z0-9_-]+/i.test(parsedUrl.pathname)
    }

    if (parsedUrl.hostname === 'drive.google.com') {
      if (/\/file\/d\/[a-zA-Z0-9_-]+/i.test(parsedUrl.pathname)) {
        return true
      }
      if (parsedUrl.searchParams.has('id') && /^[a-zA-Z0-9_-]+$/.test(parsedUrl.searchParams.get('id'))) {
        return true
      }
    }

    return false
  } catch {
    return false
  }
}

/**
 * Extracts the file ID from a Google Drive or Docs/Slides URL.
 *
 * @param {string} url - The Google Drive file URL
 * @returns {string|null} - The extracted file ID or null
 */
export function extractGoogleDriveFileId(url) {
  if (!url || typeof url !== 'string') {
    return null
  }

  const trimmedUrl = url.trim()

  const pathMatch = trimmedUrl.match(/\/(?:file|document|spreadsheets|presentation)\/d\/([a-zA-Z0-9_-]+)/i)
  if (pathMatch && pathMatch[1]) {
    return pathMatch[1]
  }

  const queryMatch = trimmedUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/i)
  if (queryMatch && queryMatch[1]) {
    return queryMatch[1]
  }

  // If string is already just an alphanumeric ID
  if (/^[a-zA-Z0-9_-]{20,}$/.test(trimmedUrl)) {
    return trimmedUrl
  }

  return null
}
