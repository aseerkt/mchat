import { getToken } from './token'

export const getAuthHeaders = () => {
  const headers: Record<string, string> = {}
  const token = getToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}
