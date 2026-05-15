import { getSupabaseAdmin, handleCors, methodNotAllowed, requireAdmin, sendError } from '../_admin.js'

export default async function handler(request, response) {
  if (handleCors(request, response)) return
  if (!requireAdmin(request, response)) return

  try {
    const supabase = getSupabaseAdmin()

    if (request.method === 'GET') {
      const [{ count: viewsCount }, { count: pendingCount }] = await Promise.all([
        supabase.from('site_views').select('*', { count: 'exact', head: true }),
        supabase.from('note_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending')
      ])

      response.status(200).json({ views: viewsCount ?? 0, pendingRequests: pendingCount ?? 0 })
      return
    }

    methodNotAllowed(response)
  } catch (error) {
    sendError(response, error, 'Unable to fetch stats.')
  }
}
