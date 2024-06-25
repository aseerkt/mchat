import { getToken } from './token'

export const getAuthHeaders = () => {
  const token = getToken()
  return {
    Authorization: token ? `Bearer ${token}` : '',
  }
}
