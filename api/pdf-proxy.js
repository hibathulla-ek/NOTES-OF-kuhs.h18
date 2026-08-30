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
    response.status(400).json({ error: 'Missing file ID' })
    return
  }

  const userAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

  try {
    // 1. Direct stream URL with confirm parameter to bypass virus scan interstitials
    const driveUrl = `https://drive.usercontent.google.com/download?id=${encodeURIComponent(fileId)}&export=download&confirm=t`

    let driveResponse = await fetch(driveUrl, {
      headers: {
        'User-Agent': userAgent,
      },
      redirect: 'follow',
    })

    let contentType = driveResponse.headers.get('content-type') || ''

    // 2. If Google returned an HTML page (error/warning/Doc), fallback to Docs export endpoint
    if (!driveResponse.ok || contentType.includes('text/html')) {
      const fallbackDocUrl = `https://docs.google.com/document/d/${encodeURIComponent(fileId)}/export?format=pdf`
      const fallbackDocRes = await fetch(fallbackDocUrl, {
        headers: {
          'User-Agent': userAgent,
        },
        redirect: 'follow',
      })

      const fallbackDocContentType = fallbackDocRes.headers.get('content-type') || ''

      if (fallbackDocRes.ok && fallbackDocContentType.includes('pdf')) {
        driveResponse = fallbackDocRes
        contentType = fallbackDocContentType
      } else {
        // 3. Fallback to standard uc download endpoint
        const fallbackUcUrl = `https://drive.google.com/uc?export=download&id=${encodeURIComponent(fileId)}&confirm=t`
        const fallbackUcRes = await fetch(fallbackUcUrl, {
          headers: {
            'User-Agent': userAgent,
          },
          redirect: 'follow',
        })

        const fallbackUcContentType = fallbackUcRes.headers.get('content-type') || ''
        if (fallbackUcRes.ok && !fallbackUcContentType.includes('text/html')) {
          driveResponse = fallbackUcRes
          contentType = fallbackUcContentType
        }
      }
    }

    if (!driveResponse.ok || contentType.includes('text/html')) {
      response.status(404).json({ error: 'Unable to render PDF stream' })
      return
    }

    const arrayBuffer = await driveResponse.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    response.setHeader('Content-Type', 'application/pdf')
    response.setHeader('Content-Disposition', 'inline; filename="document.pdf"')
    response.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=43200')
    response.setHeader('Access-Control-Allow-Origin', '*')
    response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    response.status(200).send(buffer)
  } catch (error) {
    sendError(response, error, 'Failed to fetch document stream')
  }
}
