import { Button } from '../../../components/Button'
import { Logo } from '../../../components/Logo'
import { useAuthSetter } from '../../../hooks/useAuth'
import { removeToken } from '../../../utils/token'

export const ChatHeader = () => {
  const setAuth = useAuthSetter()

  const logout = () => {
    setAuth(undefined)
    removeToken()
  }

  return (
    <header className='sticky inset-x-0 top-0 flex h-20 items-center justify-between border-b px-6 shadow'>
      <Logo />
      <div className='flex items-center gap-x-4'>
        <Button variant='secondary' onClick={logout}>
          Logout
        </Button>
      </div>
    </header>
  )
}
