import logoutSvg from '@/assets/logout-2-svgrepo-com.svg'
import { Logo } from '@/components/Logo'
import { useAuth } from '@/hooks/useAuth'
import { getSocketIO } from '@/utils/socket'
import { removeToken } from '@/utils/token'

export const ChatHeader = () => {
  const { setAuth } = useAuth()

  const logout = () => {
    const socket = getSocketIO()
    socket.disconnect()
    setAuth(undefined)
    removeToken()
  }

  return (
    <header className='sticky inset-x-0 top-0 flex h-20 items-center justify-between border-b px-6 shadow'>
      <Logo />
      <div className='flex items-center gap-x-4'>
        <button aria-label='logout' title='Logout' onClick={logout}>
          <img src={logoutSvg} alt='logout' width={20} height={20} />
        </button>
      </div>
    </header>
  )
}
