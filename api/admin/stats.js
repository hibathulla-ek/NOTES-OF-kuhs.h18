import { getSupabaseAdmin, handleCors, methodNotAllowed, requireAdmin, sendError } from '../_admin.js'

export default async function handler(request, response) {
  if (handleCors(request, response)) return
  if (!requireAdmin(request, response)) return

  try {
    const supabase = getSupabaseAdmin()

    if (request.method === 'GET') {
      const [{ data: viewRows }, { count: pendingCount }] = await Promise.all([
        supabase.from('site_views').select('ip_address').not('ip_address', 'is', null),
        supabase.from('note_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending')
      ])

      const uniqueViews = new Set((viewRows ?? []).map((row) => row.ip_address)).size

      response.status(200).json({ views: uniqueViews, pendingRequests: pendingCount ?? 0 })
      return
    }

    methodNotAllowed(response)
  } catch (error) {
    sendError(response, error, 'Unable to fetch stats.')
  }
}
