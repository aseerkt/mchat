import ReactDOM from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
import { RouterProvider } from 'react-router-dom'
import { ErrorFallback } from './components/ErrorFallback.tsx'
import './index.css'
import { router } from './router.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ErrorBoundary fallbackRender={ErrorFallback}>
    <RouterProvider router={router} />
  </ErrorBoundary>,
)
