import { handleCors, sendError } from './_admin.js'

export default async function handler(request, response) {
  if (handleCors(request, response)) return

  if (request.method !== 'GET') {
    response.setHeader('Allow', ['GET'])
    response.status(405).json({ error: 'Method not allowed' })
    return
  }

  let { fileId, url } = request.query

  // If full url is passed instead of fileId, extract file ID
  if (!fileId && url) {
    const pathMatch = url.match(/\/(?:file|document|spreadsheets|presentation)\/d\/([a-zA-Z0-9_-]+)/i)
    const queryMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/i)
    fileId = pathMatch?.[1] || queryMatch?.[1]
  }

  if (!fileId) {
    response.status(400).json({ error: 'Missing fileId parameter.' })
    return
  }

  try {
    // Attempt primary direct download stream from Google Drive
    const driveUrl = `https://drive.usercontent.google.com/download?id=${encodeURIComponent(fileId)}&export=download&confirm=t`
    let driveRes = await fetch(driveUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      redirect: 'follow',
    })

    // Fallback to standard uc endpoint if usercontent fails or returns HTML
    if (!driveRes.ok || driveRes.headers.get('content-type')?.includes('text/html')) {
      const fallbackUrl = `https://drive.google.com/uc?export=download&id=${encodeURIComponent(fileId)}&confirm=t`
      const fallbackRes = await fetch(fallbackUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        redirect: 'follow',
      })

      if (fallbackRes.ok && !fallbackRes.headers.get('content-type')?.includes('text/html')) {
        driveRes = fallbackRes
      }
    }

    if (!driveRes.ok) {
      response.status(driveRes.status).json({ error: `Google Drive returned status ${driveRes.status}` })
      return
    }

    const arrayBuffer = await driveRes.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    response.setHeader('Content-Type', 'application/pdf')
    response.setHeader('Content-Disposition', 'inline; filename="document.pdf"')
    response.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=43200')
    response.setHeader('Access-Control-Allow-Origin', '*')
    response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    response.status(200).send(buffer)
  } catch (error) {
    sendError(response, error, 'Unable to proxy PDF document.')
  }
}
