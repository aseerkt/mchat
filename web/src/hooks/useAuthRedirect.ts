import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth'

const GUEST_ROUTES = ['/auth/login', '/auth/signup']

export const useAuthRedirect = () => {
  const { auth, isLoading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (isLoading) return
    
    let navigateTo: string | undefined

    if (location.pathname === '/') {
      navigateTo = auth ? '/chat' : '/auth/login'
    } else if (auth && GUEST_ROUTES.includes(location.pathname)) {
      navigateTo = '/'
    } else if (!auth && !GUEST_ROUTES.includes(location.pathname)) {
      navigateTo = '/auth/login'
    }

    if (navigateTo) {
      navigate(navigateTo, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth, location.pathname, isLoading])

  return { isLoading }
}
