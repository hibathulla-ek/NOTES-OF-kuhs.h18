/**
 * Utilities for generating SEO-friendly note slugs and handling short ID routing.
 * Format: [note-title-slug]-[short-id]
 * Example: transfusion-transmitted-diseases-e28ef47c
 */

/**
 * Generate a clean, lowercase, URL-safe slug from a title string.
 * Strips diacritics, special characters, converts spaces and consecutive hyphens to a single hyphen.
 * @param {string} title
 * @returns {string}
 */
export function generateSlug(title) {
  if (!title || typeof title !== 'string') {
    return 'note'
  }

  const slug = title
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics / accents
    .toLowerCase()
    .replace(/[_]+/g, '-') // convert underscores to hyphens
    .replace(/[^a-z0-9\s-]/g, '') // remove special characters
    .trim()
    .replace(/[\s-]+/g, '-') // collapse whitespace and multiple hyphens
    .replace(/^-+|-+$/g, '') // trim leading/trailing hyphens

  return slug || 'note'
}

/**
 * Extracts the 8-character hexadecimal short ID from a UUID.
 * @param {string} id - Full UUID (e.g. e28ef47c-3fac-4845-9140-dd422a7695ff)
 * @returns {string} - 8-character prefix (e.g. e28ef47c)
 */
export function getNoteShortId(id) {
  if (!id || typeof id !== 'string') {
    return ''
  }

  if (id.includes('-')) {
    return id.split('-')[0].toLowerCase()
  }

  return id.replace(/[^0-9a-fA-F]/g, '').slice(0, 8).toLowerCase()
}

/**
 * Generates the full slug for a note object (e.g. "transfusion-transmitted-diseases-e28ef47c").
 * @param {{ id: string, title?: string }} note
 * @returns {string}
 */
export function getNoteSlug(note) {
  if (!note) return ''
  const titleSlug = generateSlug(note.title)
  const shortId = getNoteShortId(note.id)
  return shortId ? `${titleSlug}-${shortId}` : titleSlug
}

/**
 * Generates the canonical internal path for a note (e.g. "/notes/transfusion-transmitted-diseases-e28ef47c").
 * @param {{ id: string, title?: string }} note
 * @returns {string}
 */
export function getNotePath(note) {
  if (!note) return '/notes'
  const slug = getNoteSlug(note)
  return slug ? `/notes/${slug}` : '/notes'
}

/**
 * Generates the full shareable URL for a note.
 * @param {{ id: string, title?: string }} note
 * @returns {string}
 */
export function getNoteShareUrl(note) {
  if (!note) return window?.location?.origin || ''
  const base = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'https://notes-of-kuhs.vercel.app'
  return `${base}${getNotePath(note)}`
}

/**
 * Parses an incoming route parameter (which could be a full UUID, short ID, or slug with short ID).
 * @param {string} param
 * @returns {{ isFullUuid: boolean, shortId: string | null, fullUuid: string | null }}
 */
export function parseNoteParam(param) {
  if (!param || typeof param !== 'string') {
    return { isFullUuid: false, shortId: null, fullUuid: null }
  }

  const cleanParam = param.trim()

  // Full UUID: 8-4-4-4-12 hex characters
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
  if (uuidRegex.test(cleanParam)) {
    return {
      isFullUuid: true,
      shortId: cleanParam.split('-')[0].toLowerCase(),
      fullUuid: cleanParam.toLowerCase(),
    }
  }

  // Check for trailing 8-character hex short ID (e.g. ...-e28ef47c or just e28ef47c)
  const shortIdMatch = cleanParam.match(/(?:^|.*-)?([0-9a-fA-F]{8})$/)
  if (shortIdMatch) {
    return {
      isFullUuid: false,
      shortId: shortIdMatch[1].toLowerCase(),
      fullUuid: null,
    }
  }

  return {
    isFullUuid: false,
    shortId: null,
    fullUuid: null,
  }
}
