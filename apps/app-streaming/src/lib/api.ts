const SERVER_BASE = import.meta.env.API_URL ?? 'http://localhost:3333'
const CLIENT_BASE = import.meta.env.PUBLIC_API_URL ?? 'http://localhost:3333'

export class ApiError extends Error {
  status: number
  body: unknown
  constructor(status: number, body: unknown) {
    const msg = typeof body === 'object' && body && 'error' in body
      ? String((body as { error: unknown }).error)
      : `HTTP ${status}`
    super(msg)
    this.status = status
    this.body = body
  }
}

const parse = async <T>(res: Response): Promise<T> => {
  if (res.status === 204) return undefined as T
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new ApiError(res.status, body)
  return body as T
}

export const apiServer = async <T>(path: string, cookie: string | null, init?: RequestInit): Promise<T> => {
  const res = await fetch(`${SERVER_BASE}${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(cookie ? { cookie } : {}),
      ...(init?.headers as Record<string, string>),
    },
  })
  return parse<T>(res)
}

export const apiClient = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(`${CLIENT_BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init?.headers as Record<string, string>),
    },
  })
  return parse<T>(res)
}
