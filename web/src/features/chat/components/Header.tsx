import logoutSvg from '@/assets/logout-2-svgrepo-com.svg'
import { Logo } from '@/components/Logo'
import { logout } from '@/features/auth/auth.service'
import { useAuthSetter } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { getSocketIO } from '@/utils/socket'
import { accessToken } from '@/utils/token'

export const Header = () => {
  const { clearAuth } = useAuthSetter()
  const { toast } = useToast()

  const handleLogout = async () => {
    try {
      await logout()
      clearAuth()
      accessToken.remove()
      getSocketIO().disconnect()
    } catch (error) {
      toast({
        title: 'Logout failed',
        description: (error as Error).message,
        severity: 'error',
      })
    }
  }

  return (
    <header className='sticky inset-x-0 top-0 flex h-20 items-center justify-between border-b px-6 shadow'>
      <Logo />
      <div className='flex items-center gap-x-4'>
        <button aria-label='logout' title='Logout' onClick={handleLogout}>
          <img src={logoutSvg} alt='logout' width={20} height={20} />
        </button>
      </div>
    </header>
  )
}
