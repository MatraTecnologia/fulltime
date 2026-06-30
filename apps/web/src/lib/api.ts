const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333'

export class ApiError extends Error {
  status: number
  body: unknown
  constructor(status: number, body: unknown) {
    super(typeof body === 'object' && body && 'error' in body ? String((body as { error: unknown }).error) : `HTTP ${status}`)
    this.status = status
    this.body = body
  }
}

const parse = async (res: Response) => {
  if (res.status === 204) return undefined
  const text = await res.text()
  return text ? JSON.parse(text) : undefined
}

export const apiFetch = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  const body = await parse(res)
  if (!res.ok) throw new ApiError(res.status, body)
  return body as T
}

export const apiServer = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const { cookies } = await import('next/headers')
  const cookie = (await cookies()).toString()
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers, cookie },
    cache: 'no-store',
  })
  const body = await parse(res)
  if (!res.ok) throw new ApiError(res.status, body)
  return body as T
}
