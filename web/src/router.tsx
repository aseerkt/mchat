import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import App from './App'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: App,
    children: [
      { path: '/', lazy: () => import('./pages/Home') },
      { path: '/login', lazy: () => import('./pages/Login') },
      { path: '/signup', lazy: () => import('./pages/SignUp') },
      {
        path: '/chat',
        Component: lazy(() => import('./layouts/ChatLayout')),
        children: [
          { path: '', lazy: () => import('./pages/ChatHome') },
          { path: ':groupId', lazy: () => import('./pages/ChatRoom') },
        ],
      },
    ],
  },
])
