import { getSupabaseAdmin, handleCors, methodNotAllowed, requireAdmin, sendError } from '../_admin.js'

export default async function handler(request, response) {
  if (handleCors(request, response)) return
  if (!requireAdmin(request, response)) return

  try {
    const supabase = getSupabaseAdmin()

    if (request.method === 'GET') {
      const { data, error } = await supabase.from('mcq_settings').select('*').limit(1).single()
      if (error && error.code !== 'PGRST116') throw error
      response.status(200).json({ settings: data })
      return
    }

    if (request.method === 'PATCH') {
      const { id, is_public } = request.body
      if (!id) {
        response.status(400).json({ error: 'Missing setting id.' })
        return
      }
      const { data, error } = await supabase.from('mcq_settings').update({ is_public }).eq('id', id).select('*').single()
      if (error) throw error
      response.status(200).json({ settings: data })
      return
    }

    methodNotAllowed(response)
  } catch (error) {
    sendError(response, error, 'Unable to process mcq settings.')
  }
}
