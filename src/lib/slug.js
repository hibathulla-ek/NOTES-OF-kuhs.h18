export function generateSlug(title) {
  return (title || 'note')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')   // strip special characters
    .replace(/[\s_-]+/g, '-')    // convert spaces/underscores to hyphens
    .replace(/^-+|-+$/g, '') || 'note'; // trim boundary hyphens
}

export function generateNoteSlug(title, id) {
  const cleanTitle = generateSlug(title);
  const shortId = id ? id.split('-')[0] : ''; // 8-char short ID
  return shortId ? `${cleanTitle}-${shortId}` : cleanTitle;
}

export function getNotePath(note) {
  if (!note) return '/notes';
  const slug = note.slug || generateNoteSlug(note.title, note.id);
  return `/notes/${slug}`;
}

export function getNoteShareUrl(note) {
  if (!note) return typeof window !== 'undefined' ? window.location.origin : '';
  const origin = typeof window !== 'undefined' && window.location?.origin
    ? window.location.origin
    : 'https://notes-of-kuhs.vercel.app';
  return `${origin}${getNotePath(note)}`;
}
