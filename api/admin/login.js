import { handleCors, requireAdmin } from '../_admin.js'

export default async function handler(request, response) {
  if (handleCors(request, response)) {
    return
  }

  if (request.method !== 'POST') {
    response.setHeader('Allow', ['POST'])
    response.status(405).json({ error: 'Method not allowed' })
    return
  }

  if (!requireAdmin(request, response)) {
    return
  }

  response.status(200).json({ ok: true })
}
