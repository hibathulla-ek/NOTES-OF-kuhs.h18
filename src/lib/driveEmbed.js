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

  const fileId = extractGoogleDriveFileId(url)
  if (fileId) {
    return `https://drive.google.com/file/d/${fileId}/preview`
  }

  const trimmedUrl = url.trim()
  if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
    return trimmedUrl
  }

  return null
}

/**
 * Extracts the file ID from a Google Drive URL.
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
