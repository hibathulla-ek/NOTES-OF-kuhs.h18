/**
 * Shared helper for generating title-first note slugs with short IDs.
 * Format: [clean-title]-[short-id]
 * Example: transfusion-transmitted-diseases-e28ef47c
 */

/**
 * Generates a clean, lowercase, URL-safe slug with the first 8 characters of note ID.
 * @param {string} title - Note title
 * @param {string} id - Note UUID (e.g. e28ef47c-3fac-4845-9140-dd422a7695ff)
 * @returns {string} - Combined slug (e.g. transfusion-transmitted-diseases-e28ef47c)
 */
export function generateNoteSlug(title, id) {
  const cleanTitle = (title || 'note')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // remove special characters
    .replace(/[\s_-]+/g, '-') // collapse dashes/spaces
    .replace(/^-+|-+$/g, '') || 'note'

  const shortId = (id ? id.split('-')[0] : '').toLowerCase()
  return shortId ? `${cleanTitle}-${shortId}` : cleanTitle
}

/**
 * Returns the relative path for a note.
 * @param {{ title?: string, id?: string }} note
 * @returns {string}
 */
export function getNotePath(note) {
  if (!note || !note.id) return '/notes'
  return `/notes/${generateNoteSlug(note.title, note.id)}`
}

/**
 * Returns the absolute shareable URL for a note.
 * @param {{ title?: string, id?: string }} note
 * @returns {string}
 */
export function getNoteShareUrl(note) {
  if (!note || !note.id) return typeof window !== 'undefined' ? window.location.origin : ''
  const origin = typeof window !== 'undefined' && window.location?.origin
    ? window.location.origin
    : 'https://notes-of-kuhs.vercel.app'
  return `${origin}${getNotePath(note)}`
}
