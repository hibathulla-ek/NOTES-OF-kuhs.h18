import { getSupabaseAdmin, handleCors, methodNotAllowed, requireAdmin, sendError } from '../_admin.js'

export default async function handler(request, response) {
  if (handleCors(request, response)) {
    return
  }

  if (!requireAdmin(request, response)) {
    return
  }

  const { id } = request.query

  try {
    const supabase = getSupabaseAdmin()

    if (request.method === 'GET') {
      if (id) {
        const { data, error } = await supabase.from('notes').select('*').eq('id', id).single()
        if (error) throw error
        response.status(200).json({ note: data })
        return
      }

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      await supabase.from('notes').delete().not('deleted_at', 'is', null).lt('deleted_at', thirtyDaysAgo)

      const isTrash = request.query.trash === 'true'
      let query = supabase.from('notes').select('*').order('created_at', { ascending: false })
      query = isTrash ? query.not('deleted_at', 'is', null) : query.is('deleted_at', null)

      const { data, error } = await query

      if (error) {
        throw error
      }

      response.status(200).json({ notes: data ?? [] })
      return
    }

function cleanSlug(title) {
  return (title || 'note')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'note'
}

async function generateUniqueSlug(supabase, title, existingId = null) {
  const base = cleanSlug(title)
  let candidate = base
  let counter = 1

  while (true) {
    let query = supabase.from('notes').select('id').eq('slug', candidate)
    if (existingId) {
      query = query.neq('id', existingId)
    }
    const { data, error } = await query
    if (error || !data || data.length === 0) {
      return candidate
    }
    candidate = `${base}-${counter++}`
  }
}

    if (request.method === 'POST') {
      const payload = { ...request.body }
      if (payload.title && (!payload.slug || typeof payload.slug !== 'string' || !payload.slug.trim())) {
        payload.slug = await generateUniqueSlug(supabase, payload.title)
      } else if (payload.slug) {
        payload.slug = cleanSlug(payload.slug)
      }

      const { data, error } = await supabase.from('notes').insert(payload).select('*').single()

      if (error) {
        throw error
      }

      response.status(201).json({ note: data })
      return
    }

    if (request.method === 'PATCH') {
      if (!id) {
        response.status(400).json({ error: 'Missing note id.' })
        return
      }

      const payload = { ...request.body }
      if (payload.title && (!payload.slug || typeof payload.slug !== 'string' || !payload.slug.trim())) {
        payload.slug = await generateUniqueSlug(supabase, payload.title, id)
      } else if (payload.slug) {
        payload.slug = cleanSlug(payload.slug)
      }

      const { data, error } = await supabase.from('notes').update(payload).eq('id', id).select('*').single()
      if (error) throw error

      response.status(200).json({ note: data })
      return
    }

    if (request.method === 'DELETE') {
      if (!id) {
        response.status(400).json({ error: 'Missing note id.' })
        return
      }

      const isPermanent = request.query.permanent === 'true'

      if (isPermanent) {
        const { error } = await supabase.from('notes').delete().eq('id', id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('notes').update({ deleted_at: new Date().toISOString() }).eq('id', id)
        if (error) throw error
      }

      response.status(200).json({ ok: true })
      return
    }

    methodNotAllowed(response)
  } catch (error) {
    sendError(response, error, 'Unable to process notes request.')
  }
}
