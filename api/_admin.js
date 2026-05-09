import { createClient } from '@supabase/supabase-js'

function sendJson(response, status, payload) {
  response.status(status).json(payload)
}

export function requireAdmin(request, response) {
  const expectedPassword = process.env.ADMIN_PASSWORD
  const providedPassword = request.headers['x-admin-password']

  if (!expectedPassword || providedPassword !== expectedPassword) {
    sendJson(response, 401, { error: 'Unauthorized' })
    return false
  }

  return true
}

export function getSupabaseAdmin() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Server Supabase environment variables are not configured.')
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

export function sendError(response, error, fallback = 'Request failed.') {
  const message = error?.message || fallback
  sendJson(response, 500, { error: message })
}

export function methodNotAllowed(response) {
  response.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE'])
  sendJson(response, 405, { error: 'Method not allowed' })
}
