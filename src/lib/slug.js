export function generateNoteSlug(title, id) {
  const cleanTitle = (title || 'note')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')   // strip special characters
    .replace(/[\s_-]+/g, '-')    // convert spaces/underscores to hyphens
    .replace(/^-+|-+$/g, '') || 'note';    // trim boundary hyphens
  
  const shortId = id ? id.split('-')[0] : ''; // 8-char short ID
  return shortId ? `${cleanTitle}-${shortId}` : cleanTitle;
}

export function getNotePath(note) {
  if (!note || !note.id) return '/notes';
  return `/notes/${generateNoteSlug(note.title, note.id)}`;
}

export function getNoteShareUrl(note) {
  if (!note || !note.id) return typeof window !== 'undefined' ? window.location.origin : '';
  const origin = typeof window !== 'undefined' && window.location?.origin
    ? window.location.origin
    : 'https://notes-of-kuhs.vercel.app';
  return `${origin}${getNotePath(note)}`;
}
