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
