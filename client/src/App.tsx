import { Outlet } from 'react-router-dom'
import { Toaster } from './components/Toaster'
import { useAuthRedirect } from './hooks/useAuthRedirect'
import { QueryCacheProvider } from './providers/QueryCacheProvider'
import { UserProvider } from './providers/UserProvider'

const AuthRedirect = () => {
  useAuthRedirect()
  return null
}

function App() {
  return (
    <UserProvider>
      <AuthRedirect />
      <QueryCacheProvider>
        <Outlet />
      </QueryCacheProvider>
      <Toaster />
    </UserProvider>
  )
}

export default App
