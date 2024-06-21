import { useAuthState } from '../../../hooks/useAuth'
import { cn } from '../../../utils/style'

export const ChatUser = ({ isConnected }: { isConnected: boolean }) => {
  const auth = useAuthState()
  return (
    <header className='flex h-14 shrink-0 items-center gap-4 rounded border-b bg-cyan-200 p-2 px-6'>
      <span
        className={cn(
          'h-4 w-4 rounded-full',
          isConnected ? 'bg-green-800' : 'bg-gray-500',
        )}
      ></span>
      <b className='text-xl font-bold'>{auth?.username}</b>
    </header>
  )
}
