import { getSupabaseAdmin, handleCors, methodNotAllowed, requireAdmin, sendError } from '../_admin.js'

export default async function handler(request, response) {
  if (handleCors(request, response)) return
  if (!requireAdmin(request, response)) return

  const { id } = request.query

  try {
    const supabase = getSupabaseAdmin()

    if (request.method === 'GET') {
      const { data, error } = await supabase.from('note_requests').select('*').order('requested_at', { ascending: false })
      if (error) throw error
      response.status(200).json({ requests: data ?? [] })
      return
    }

    if (request.method === 'PATCH') {
      if (!id) {
        response.status(400).json({ error: 'Missing request id.' })
        return
      }

      const { data, error } = await supabase.from('note_requests').update(request.body).eq('id', id).select('*').single()
      if (error) throw error
      response.status(200).json({ request: data })
      return
    }

    if (request.method === 'DELETE') {
      if (!id) {
        response.status(400).json({ error: 'Missing request id.' })
        return
      }

      const { error } = await supabase.from('note_requests').delete().eq('id', id)
      if (error) throw error
      response.status(200).json({ ok: true })
      return
    }

    methodNotAllowed(response)
  } catch (error) {
    sendError(response, error, 'Unable to process requests.')
  }
}
