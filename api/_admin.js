import { createClient } from '@supabase/supabase-js'

const allowedOrigins = new Set([
  'http://127.0.0.1:5173',
  'http://localhost:5173',
  'https://notes-of-kuhs.vercel.app',
])

export function applyCors(request, response) {
  const origin = request.headers.origin

  if (allowedOrigins.has(origin)) {
    response.setHeader('Access-Control-Allow-Origin', origin)
  }

  response.setHeader('Vary', 'Origin')
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type,x-admin-password')
}

export function handleCors(request, response) {
  applyCors(request, response)

  if (request.method === 'OPTIONS') {
    response.status(204).end()
    return true
  }

  return false
}

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
