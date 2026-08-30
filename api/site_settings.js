import { getSupabaseAdmin, handleCors, sendError } from './_admin.js'

export default async function handler(request, response) {
  if (handleCors(request, response)) return

  try {
    const supabase = getSupabaseAdmin()

    if (request.method === 'GET') {
      const { data, error } = await supabase
        .from('site_settings')
        .select('is_maintenance_mode, maintenance_title, maintenance_message, start_time, end_time, updated_at')
        .limit(1)
        .maybeSingle()

      if (error) throw error

      const settings = data || {
        is_maintenance_mode: false,
        maintenance_title: 'System Maintenance Underway',
        maintenance_message: 'We are currently upgrading the platform to serve you better. Public access is temporarily paused.',
        start_time: null,
        end_time: null,
      }

      response.setHeader('Cache-Control', 'no-store, max-age=0')
      response.status(200).json({ settings })
      return
    }

    response.setHeader('Allow', ['GET'])
    response.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    sendError(response, error, 'Unable to fetch site settings.')
  }
}
