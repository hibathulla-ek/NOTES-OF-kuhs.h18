/**
 * Extracts Google Drive file ID and returns the preview embed URL.
 *
 * Supports URLs like:
 * - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * - https://drive.google.com/file/d/FILE_ID/preview
 * - https://drive.google.com/open?id=FILE_ID
 * - https://drive.google.com/uc?id=FILE_ID
 * - https://docs.google.com/document/d/FILE_ID/edit
 * - https://docs.google.com/presentation/d/FILE_ID/edit
 * - https://docs.google.com/spreadsheets/d/FILE_ID/edit
 *
 * @param {string} url - The Google Drive file URL
 * @returns {string|null} - The embeddable preview URL or null if invalid
 */
export function getGoogleDriveEmbedUrl(url) {
  if (!url || typeof url !== 'string') {
    return null
  }

  const trimmedUrl = url.trim()

  // Match /file/d/{id}, /document/d/{id}, /spreadsheets/d/{id}, /presentation/d/{id}
  const pathMatch = trimmedUrl.match(/\/(?:file|document|spreadsheets|presentation)\/d\/([a-zA-Z0-9_-]+)/i)
  if (pathMatch && pathMatch[1]) {
    return `https://drive.google.com/file/d/${pathMatch[1]}/preview`
  }

  // Match ?id={id} or &id={id} (e.g. drive.google.com/open?id=...)
  const queryMatch = trimmedUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/i)
  if (queryMatch && queryMatch[1]) {
    return `https://drive.google.com/file/d/${queryMatch[1]}/preview`
  }

  // Fallback: If it's already an http(s) link, check if it's a direct URL
  if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
    return trimmedUrl
  }

  return null
}
