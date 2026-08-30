import { getSupabaseAdmin, handleCors, methodNotAllowed, requireAdmin, sendError } from '../_admin.js'

export default async function handler(request, response) {
  if (handleCors(request, response)) return
  if (!requireAdmin(request, response)) return

  const { id } = request.query

  try {
    const supabase = getSupabaseAdmin()

    if (request.method === 'GET') {
      if (id) {
        const { data, error } = await supabase.from('mcqs').select('*').eq('id', id).single()
        if (error) throw error
        response.status(200).json({ mcq: data })
        return
      }

      const { data, error } = await supabase.from('mcqs').select('*').order('created_at', { ascending: false })
      if (error) throw error
      response.status(200).json({ mcqs: data ?? [] })
      return
    }

    if (request.method === 'POST') {
      const { data, error } = await supabase.from('mcqs').insert(request.body).select('*').single()
      if (error) throw error
      response.status(201).json({ mcq: data })
      return
    }

    if (request.method === 'PATCH') {
      if (!id) {
        response.status(400).json({ error: 'Missing mcq id.' })
        return
      }

      const { data, error } = await supabase.from('mcqs').update(request.body).eq('id', id).select('*').single()
      if (error) throw error
      response.status(200).json({ mcq: data })
      return
    }

    if (request.method === 'DELETE') {
      if (!id) {
        response.status(400).json({ error: 'Missing mcq id.' })
        return
      }

      const { error } = await supabase.from('mcqs').delete().eq('id', id)
      if (error) throw error
      response.status(200).json({ ok: true })
      return
    }

    methodNotAllowed(response)
  } catch (error) {
    sendError(response, error, 'Unable to process mcqs.')
  }
}
