import { getSupabaseAdmin, handleCors, sendError } from '../_admin.js'

export default async function handler(request, response) {
  if (handleCors(request, response)) return

  if (request.method !== 'POST') {
    response.setHeader('Allow', ['POST'])
    response.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { email, password } = request.body
  const ip = request.headers['x-forwarded-for'] || request.headers['x-real-ip'] || request.socket?.remoteAddress || 'unknown'
  const clientIp = typeof ip === 'string' ? ip.split(',')[0].trim() : 'unknown'

  if (!email || !password) {
    response.status(400).json({ error: 'Email and password are required.' })
    return
  }

  try {
    const supabase = getSupabaseAdmin()
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString()
    const expectedEmail = (process.env.ADMIN_EMAIL || 'admin@notesofkuhs.com').toLowerCase().trim()
    const normalizedEmail = email.toLowerCase().trim()

    // 1. Check brute force: count failed attempts in the last 15 minutes
    const { count: failedAttempts, error: attemptError } = await supabase
      .from('admin_login_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('email', normalizedEmail)
      .eq('is_successful', false)
      .gte('attempted_at', fifteenMinutesAgo)

    if (attemptError) throw attemptError

    if ((failedAttempts ?? 0) >= 5) {
      response.status(429).json({
        error: 'Too many failed login attempts. Please try again after 15 minutes.'
      })
      return
    }

    // 2. Validate credentials against the single configured admin account
    const expectedPassword = process.env.ADMIN_PASSWORD
    if (normalizedEmail !== expectedEmail || !expectedPassword || password !== expectedPassword) {
      await supabase
        .from('admin_login_attempts')
        .insert([{ email: normalizedEmail, ip_address: clientIp, is_successful: false }])

      response.status(401).json({ error: 'Incorrect email or password.' })
      return
    }

    // Log successful attempt
    await supabase
      .from('admin_login_attempts')
      .insert([{ email: normalizedEmail, ip_address: clientIp, is_successful: true }])

    // Return ADMIN_PASSWORD so it can be reused in the x-admin-password header on subsequent admin calls
    response.status(200).json({ ok: true, password: expectedPassword })
  } catch (error) {
    sendError(response, error, 'Login failed.')
  }
}
