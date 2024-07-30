import { Outlet } from 'react-router-dom'
import { ConfirmDialogProvider } from './components/ConfirmDialog'
import { PageLoader } from './components/PageLoader'
import { Toaster } from './components/Toaster'
import { useAuthRedirect } from './hooks/useAuthRedirect'

const AuthWrapper = ({ children }: React.PropsWithChildren) => {
  const { isLoading } = useAuthRedirect()

  return isLoading ? <PageLoader /> : <>{children}</>
}

export default function App() {
  return (
    <AuthWrapper>
      <ConfirmDialogProvider>
        <Outlet />
      </ConfirmDialogProvider>
      <Toaster />
    </AuthWrapper>
  )
}
