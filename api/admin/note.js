import { getSupabaseAdmin, handleCors, methodNotAllowed, requireAdmin, sendError } from '../_admin.js'

export default async function handler(request, response) {
  if (handleCors(request, response)) {
    return
  }

  if (!requireAdmin(request, response)) {
    return
  }

  const { id } = request.query

  if (!id) {
    response.status(400).json({ error: 'Missing note id.' })
    return
  }

  try {
    const supabase = getSupabaseAdmin()

    if (request.method === 'GET') {
      const { data, error } = await supabase.from('notes').select('*').eq('id', id).single()

      if (error) {
        throw error
      }

      response.status(200).json({ note: data })
      return
    }

    if (request.method === 'PATCH') {
      const { data, error } = await supabase.from('notes').update(request.body).eq('id', id).select('*').single()

      if (error) {
        throw error
      }

      response.status(200).json({ note: data })
      return
    }

    if (request.method === 'DELETE') {
      const isPermanent = request.query.permanent === 'true'

      if (isPermanent) {
        const { error } = await supabase.from('notes').delete().eq('id', id)

        if (error) {
          throw error
        }
      } else {
        const { error } = await supabase.from('notes').update({ deleted_at: new Date().toISOString() }).eq('id', id)

        if (error) {
          throw error
        }
      }

      response.status(200).json({ ok: true })
      return
    }

    methodNotAllowed(response)
  } catch (error) {
    sendError(response, error, 'Unable to process note request.')
  }
}
