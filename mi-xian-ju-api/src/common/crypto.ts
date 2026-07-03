const PASSWORD_ITERATIONS = 100_000
const PASSWORD_ALGORITHM = 'pbkdf2_sha256'

function bytesToBase64(bytes: Uint8Array) {
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary)
}

function base64ToBytes(value: string) {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return bytes
}

function base64Url(value: string) {
  return value.replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return bytesToBase64(new Uint8Array(digest))
}

async function pbkdf2(password: string, salt: Uint8Array, iterations: number) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, [
    'deriveBits',
  ])
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt,
      iterations,
    },
    key,
    256,
  )
  return bytesToBase64(new Uint8Array(bits))
}

export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const hash = await pbkdf2(password, salt, PASSWORD_ITERATIONS)
  return `${PASSWORD_ALGORITHM}$${PASSWORD_ITERATIONS}$${bytesToBase64(salt)}$${hash}`
}

export async function verifyPassword(password: string, encoded: string) {
  const [algorithm, iterationsRaw, saltRaw, expectedHash] = encoded.split('$')
  if (algorithm !== PASSWORD_ALGORITHM || !iterationsRaw || !saltRaw || !expectedHash) {
    return false
  }

  const iterations = Number(iterationsRaw)
  if (!Number.isFinite(iterations) || iterations <= 0) {
    return false
  }

  const actualHash = await pbkdf2(password, base64ToBytes(saltRaw), iterations)
  return actualHash === expectedHash
}

export async function generateToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  return base64Url(bytesToBase64(bytes))
}

export async function hashToken(token: string) {
  return sha256(token)
}
