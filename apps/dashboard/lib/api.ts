import axios from "axios"

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333",
  withCredentials: true,
})

export const getApiErrorMessage = (error: unknown, fallback = "Algo deu errado. Tente novamente.") => {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as { error?: string } | undefined)?.error ?? error.message ?? fallback
  }
  return fallback
}
