import axios, { AxiosError } from 'axios'

import { api } from '@/lib/axios'

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

export const apiFetch = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const { method, body, headers } = init ?? {}
  try {
    const res = await api.request<T>({
      url: path,
      method: (method as string) ?? 'GET',
      data: body ? JSON.parse(body as string) : undefined,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(headers as Record<string, string>),
      },
    })
    if (res.status === 204) return undefined as T
    return res.data
  } catch (err) {
    if (err instanceof AxiosError) throw new ApiError(err.response?.status ?? 0, err.response?.data)
    throw err
  }
}

export const apiServer = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const { cookies } = await import('next/headers')
  const cookie = (await cookies()).toString()
  const { method, body, headers } = init ?? {}
  try {
    const res = await axios.request<T>({
      baseURL: BASE,
      url: path,
      method: (method as string) ?? 'GET',
      data: body ? JSON.parse(body as string) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...(headers as Record<string, string>),
        cookie,
      },
    })
    if (res.status === 204) return undefined as T
    return res.data
  } catch (err) {
    if (err instanceof AxiosError) throw new ApiError(err.response?.status ?? 0, err.response?.data)
    throw err
  }
}
