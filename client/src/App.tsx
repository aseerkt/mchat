import { Outlet } from 'react-router-dom'
import { Toaster } from './components/Toaster'
import { useAuthRedirect } from './hooks/useAuthRedirect'
import { UserProvider } from './providers/UserProvider'

const AuthRedirect = () => {
  useAuthRedirect()
  return null
}

function App() {
  return (
    <UserProvider>
      <AuthRedirect />
      <Outlet />
      <Toaster />
    </UserProvider>
  )
}

export default App
