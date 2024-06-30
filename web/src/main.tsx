import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ReactDOM from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
import { RouterProvider } from 'react-router-dom'
import { ErrorFallback } from './components/ErrorFallback.tsx'
import './index.css'
import { router } from './router.tsx'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ErrorBoundary fallbackRender={ErrorFallback}>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </ErrorBoundary>,
)
