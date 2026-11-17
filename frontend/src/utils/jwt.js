export function decodeJwtPayload(token) {
  try {
    if (typeof token !== 'string') return null
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    const binary = atob(padded)
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
    return JSON.parse(new TextDecoder().decode(bytes))
  } catch { return null }
}

export function isTokenExpired(token, nowMs = Date.now()) {
  const payload = decodeJwtPayload(token)
  return !payload || typeof payload.exp !== 'number' || payload.exp * 1000 <= nowMs
}
