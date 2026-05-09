import { getSupabaseAdmin, methodNotAllowed, requireAdmin, sendError } from '../_admin.js'

export default async function handler(request, response) {
  if (!requireAdmin(request, response)) {
    return
  }

  try {
    const supabase = getSupabaseAdmin()

    if (request.method === 'GET') {
      const { data, error } = await supabase.from('notes').select('*').order('created_at', { ascending: false })

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
