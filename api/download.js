import { getSupabaseAdmin, handleCors, sendError } from './_admin.js'

export default async function handler(request, response) {
  if (handleCors(request, response)) return

  const ip = request.headers['x-forwarded-for'] || request.headers['x-real-ip'] || request.socket?.remoteAddress || 'unknown'
  const clientIp = typeof ip === 'string' ? ip.split(',')[0].trim() : 'unknown'

  try {
    const supabase = getSupabaseAdmin()
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    // Status check request
    if (request.query.status === '1') {
      const { count, error } = await supabase
        .from('downloads')
        .select('*', { count: 'exact', head: true })
        .eq('ip_address', clientIp)
        .gte('downloaded_at', twentyFourHoursAgo)

      if (error) throw error

      response.status(200).json({ limitReached: (count ?? 0) >= 15, count: count ?? 0 })
      return
    }

    // Download file request
    if (request.method === 'GET') {
      const { id, type } = request.query

      if (!id || !type) {
        response.status(400).json({ error: 'Missing file id or type.' })
        return
      }

      if (type !== 'note' && type !== 'question') {
        response.status(400).json({ error: 'Invalid file type.' })
        return
      }

      // Check current rolling 24-hour count
      const { count, error: countError } = await supabase
        .from('downloads')
        .select('*', { count: 'exact', head: true })
        .eq('ip_address', clientIp)
        .gte('downloaded_at', twentyFourHoursAgo)

      if (countError) throw countError

      if ((count ?? 0) >= 15) {
        response.status(429).json({ error: 'Too Many Requests' })
        return
      }

      // Fetch file info
      const tableName = type === 'note' ? 'notes' : 'questions'
      const { data, error: fetchError } = await supabase
        .from(tableName)
        .select('drive_url, is_active')
        .eq('id', id)
        .single()

      if (fetchError || !data || !data.is_active) {
        response.status(404).json({ error: 'File not found or inactive.' })
        return
      }

      // Log download
      const { error: insertError } = await supabase
        .from('downloads')
        .insert([{ ip_address: clientIp, file_id: id, file_type: type }])

      if (insertError) throw insertError

      response.status(200).json({ url: data.drive_url })
      return
    }

    response.setHeader('Allow', ['GET'])
    response.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    sendError(response, error, 'Unable to process download.')
  }
}
