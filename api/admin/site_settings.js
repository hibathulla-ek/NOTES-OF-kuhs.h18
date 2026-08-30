import { getSupabaseAdmin, handleCors, methodNotAllowed, requireAdmin, sendError } from '../_admin.js'

export default async function handler(request, response) {
  if (handleCors(request, response)) return
  if (!requireAdmin(request, response)) return

  try {
    const supabase = getSupabaseAdmin()

    if (request.method === 'GET') {
      const { data, error } = await supabase.from('site_settings').select('*').limit(1).maybeSingle()
      if (error) {
        if (error.code === '42P01' || error.message?.includes('schema cache')) {
          response.status(200).json({
            settings: {
              is_maintenance_mode: false,
              maintenance_title: 'System Maintenance Underway',
              maintenance_message: 'We are currently upgrading the platform to serve you better. Public access is temporarily paused.',
              start_time: null,
              end_time: null,
              _needsMigration: true,
            },
          })
          return
        }
        throw error
      }

      if (!data) {
        // Fallback default response if no row yet
        const defaultSettings = {
          is_maintenance_mode: false,
          maintenance_title: 'System Maintenance Underway',
          maintenance_message: 'We are currently upgrading the platform to serve you better. Public access is temporarily paused.',
          start_time: null,
          end_time: null,
        }
        const { data: inserted, error: insertError } = await supabase.from('site_settings').insert([defaultSettings]).select('*').single()
        if (insertError) throw insertError
        response.status(200).json({ settings: inserted })
        return
      }

      response.status(200).json({ settings: data })
      return
    }

    if (request.method === 'PATCH' || request.method === 'POST') {
      const { id, is_maintenance_mode, maintenance_title, maintenance_message, start_time, end_time } = request.body || {}
      
      const payload = {
        is_maintenance_mode: typeof is_maintenance_mode === 'boolean' ? is_maintenance_mode : false,
        maintenance_title: typeof maintenance_title === 'string' ? maintenance_title : 'System Maintenance Underway',
        maintenance_message: typeof maintenance_message === 'string' ? maintenance_message : 'We are currently upgrading the platform to serve you better. Public access is temporarily paused.',
        start_time: start_time || null,
        end_time: end_time || null,
        updated_at: new Date().toISOString(),
      }

      let data, error
      if (id) {
        const res = await supabase.from('site_settings').update(payload).eq('id', id).select('*').single()
        data = res.data
        error = res.error
      } else {
        const existing = await supabase.from('site_settings').select('id').limit(1).maybeSingle()
        if (existing.data?.id) {
          const res = await supabase.from('site_settings').update(payload).eq('id', existing.data.id).select('*').single()
          data = res.data
          error = res.error
        } else {
          const res = await supabase.from('site_settings').insert([payload]).select('*').single()
          data = res.data
          error = res.error
        }
      }

      if (error) {
        if (error.code === '42P01' || error.message?.includes('schema cache')) {
          response.status(400).json({
            error: "The 'site_settings' table has not been created in Supabase yet. Please run the SQL schema migration in Supabase SQL editor.",
          })
          return
        }
        throw error
      }
      response.status(200).json({ settings: data })
      return
    }

    methodNotAllowed(response)
  } catch (error) {
    sendError(response, error, 'Unable to process site settings.')
  }
}
