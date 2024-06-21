import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthState } from './useAuth'

const GUEST_ROUTES = ['/login', '/signup']

export const useAuthRedirect = () => {
  const auth = useAuthState()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    let navigateTo: string | undefined

    if (location.pathname === '/') {
      navigateTo = auth ? '/chat' : '/login'
    } else if (auth && GUEST_ROUTES.includes(location.pathname)) {
      navigateTo = '/'
    } else if (!auth && !GUEST_ROUTES.includes(location.pathname)) {
      navigateTo = '/login'
    }

    if (navigateTo) {
      console.log('navigating to: ', navigateTo)
      navigate(navigateTo, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth, location.pathname])
}
