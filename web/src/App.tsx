import { ErrorBoundary } from 'react-error-boundary'
import { Outlet } from 'react-router-dom'
import { ErrorFallback } from './components/ErrorFallback'
import { Toaster } from './components/Toaster'
import { useAuthRedirect } from './hooks/useAuthRedirect'
import { UserProvider } from './providers/UserProvider'

const AuthRedirect = () => {
  useAuthRedirect()
  return null
}

function App() {
  return (
    <ErrorBoundary fallbackRender={ErrorFallback}>
      <UserProvider>
        <AuthRedirect />
        <Outlet />
        <Toaster />
      </UserProvider>
    </ErrorBoundary>
  )
}

export default App
