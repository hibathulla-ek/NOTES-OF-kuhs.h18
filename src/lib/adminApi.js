async function readApiResponse(response) {
  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload.error || 'Admin request failed.')
  }

  return payload
}

const localAdminApiBaseUrl = import.meta.env.VITE_ADMIN_API_BASE_URL ?? ''

export async function adminRequest(path, { method = 'GET', body, password } = {}) {
  const url = localAdminApiBaseUrl ? `${localAdminApiBaseUrl}${path}` : path

  return readApiResponse(
    await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': password,
      },
      body: body ? JSON.stringify(body) : undefined,
    }),
  )
}
