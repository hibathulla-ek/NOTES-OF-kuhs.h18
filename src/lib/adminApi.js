async function readApiResponse(response) {
  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload.error || 'Admin request failed.')
  }

  return payload
}

export async function adminRequest(path, { method = 'GET', body, password } = {}) {
  return readApiResponse(
    await fetch(path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': password,
      },
      body: body ? JSON.stringify(body) : undefined,
    }),
  )
}
