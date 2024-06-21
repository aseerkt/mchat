export const config = {
  isDev: import.meta.env.DEV,
  backendUrl:
    (import.meta.env.VITE_BACKEND_URL as string | undefined) ||
    'http://localhost:5000',
  tokenKey: 'jwt',
}
