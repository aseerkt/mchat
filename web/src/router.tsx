import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import { ErrorFallback } from './components/ErrorFallback'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: App,
    errorElement: <ErrorFallback />,
    children: [
      { path: '/', lazy: () => import('./pages/Home') },
      { path: '/login', lazy: () => import('./pages/Login') },
      { path: '/signup', lazy: () => import('./pages/SignUp') },
      {
        path: '/chat',
        Component: lazy(() => import('./features/chat/layouts/ChatLayout')),
        children: [
          { path: '', lazy: () => import('./pages/ChatHome') },
          { path: 'group/:groupId', lazy: () => import('./pages/ChatRoom') },
          {
            path: 'direct/:receiverId',
            lazy: () => import('./pages/ChatDM'),
          },
        ],
      },
    ],
  },
])
