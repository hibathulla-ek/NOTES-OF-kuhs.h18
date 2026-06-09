import { getSupabaseAdmin, handleCors, sendError } from '../_admin.js'

export default async function handler(request, response) {
  if (handleCors(request, response)) return

  if (request.method !== 'POST') {
    response.setHeader('Allow', ['POST'])
    response.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { action, email, otp } = request.body
  const ip = request.headers['x-forwarded-for'] || request.headers['x-real-ip'] || request.socket?.remoteAddress || 'unknown'
  const clientIp = typeof ip === 'string' ? ip.split(',')[0].trim() : 'unknown'

  if (!email) {
    response.status(400).json({ error: 'Email is required.' })
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

    // 2. Handle send_otp action
    if (action === 'send_otp') {
      if (normalizedEmail !== expectedEmail) {
        // Log a failed attempt to prevent email discovery brute forcing and to trigger cooldown for random scans
        await supabase
          .from('admin_login_attempts')
          .insert([{ email: normalizedEmail, ip_address: clientIp, is_successful: false }])

        response.status(401).json({ error: 'Unauthorized email address.' })
        return
      }

      // Trigger Supabase OTP send
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          shouldCreateUser: false
        }
      })

      if (otpError) throw otpError

      response.status(200).json({ ok: true })
      return
    }

    // 3. Handle verify_otp action
    if (action === 'verify_otp') {
      if (!otp) {
        response.status(400).json({ error: 'Verification code is required.' })
        return
      }

      if (normalizedEmail !== expectedEmail) {
        response.status(401).json({ error: 'Unauthorized email address.' })
        return
      }

      // Verify OTP with Supabase
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: normalizedEmail,
        token: otp,
        type: 'email'
      })

      if (verifyError || !data || !data.session) {
        // Log failed attempt
        await supabase
          .from('admin_login_attempts')
          .insert([{ email: normalizedEmail, ip_address: clientIp, is_successful: false }])

        response.status(401).json({ error: 'Incorrect verification code.' })
        return
      }

      // Log successful attempt
      await supabase
        .from('admin_login_attempts')
        .insert([{ email: normalizedEmail, ip_address: clientIp, is_successful: true }])

      // Return ok and ADMIN_PASSWORD to match the existing requireAdmin checks on subsequent admin calls
      response.status(200).json({ ok: true, password: process.env.ADMIN_PASSWORD })
      return
    }

    response.status(400).json({ error: 'Invalid action.' })
  } catch (error) {
    sendError(response, error, 'Login failed.')
  }
}
