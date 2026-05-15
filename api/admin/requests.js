import { getSupabaseAdmin, handleCors, methodNotAllowed, requireAdmin, sendError } from '../_admin.js'

export default async function handler(request, response) {
  if (handleCors(request, response)) return
  if (!requireAdmin(request, response)) return

  try {
    const supabase = getSupabaseAdmin()

    if (request.method === 'GET') {
      const { data, error } = await supabase.from('note_requests').select('*').order('requested_at', { ascending: false })
      if (error) throw error
      response.status(200).json({ requests: data ?? [] })
      return
    }

    methodNotAllowed(response)
  } catch (error) {
    sendError(response, error, 'Unable to process requests.')
  }
}
