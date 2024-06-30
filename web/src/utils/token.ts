import { config } from '../config'

let globalToken = ''

export const getToken = () => {
  if (!globalToken) {
    return localStorage.getItem(config.tokenKey)
  }
  return globalToken
}

export const setToken = (token: string) => {
  globalToken = token
  localStorage.setItem(config.tokenKey, token)
}

export const removeToken = () => {
  globalToken = ''
  localStorage.removeItem(config.tokenKey)
}

export const decodeToken = () => {
  const token = getToken()

  if (!token) return

  const base64Url = token.split('.')[1]
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      })
      .join(''),
  )

  return JSON.parse(jsonPayload)
}
