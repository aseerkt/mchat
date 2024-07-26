const ACCESS_TOKEN_EXPIRY_OFFSET = 5 * 1000 // 5 seconds

export const config = {
  isDev: import.meta.env.DEV,
  backendUrl:
    (import.meta.env.VITE_BACKEND_URL as string | undefined) ||
    'http://localhost:5000',
  tokenKey: 'jwt',
  accessTokenExpiry: 15 * 60 * 1000 - ACCESS_TOKEN_EXPIRY_OFFSET,
}
