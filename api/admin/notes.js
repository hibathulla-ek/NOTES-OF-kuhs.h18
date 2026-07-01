import { getSupabaseAdmin, handleCors, methodNotAllowed, requireAdmin, sendError } from '../_admin.js'

export default async function handler(request, response) {
  if (handleCors(request, response)) {
    return
  }

  if (!requireAdmin(request, response)) {
    return
  }

  try {
    const supabase = getSupabaseAdmin()

    if (request.method === 'GET') {
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

    if (request.method === 'POST') {
      const { data, error } = await supabase.from('notes').insert(request.body).select('*').single()

      if (error) {
        throw error
      }

      response.status(201).json({ note: data })
      return
    }

    methodNotAllowed(response)
  } catch (error) {
    sendError(response, error, 'Unable to process notes request.')
  }
}
