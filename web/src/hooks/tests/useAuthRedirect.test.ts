import { renderHook } from '@testing-library/react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Mock } from 'vitest'
import { useAuthState } from '../useAuth'
import { useAuthRedirect } from '../useAuthRedirect'

vi.mock('react-router-dom', () => ({
  useLocation: vi.fn(),
  useNavigate: vi.fn(),
}))

vi.mock('../useAuth', () => ({
  useAuthState: vi.fn(),
}))

describe('useAuthRedirect', () => {
  it('should navigate to /chat if authenticated and on the root path', () => {
    const mockNavigate = vi.fn()
    ;(useLocation as Mock).mockReturnValue({ pathname: '/' })
    ;(useNavigate as Mock).mockReturnValue(mockNavigate)
    ;(useAuthState as Mock).mockReturnValue(true)

    renderHook(() => useAuthRedirect())

    expect(mockNavigate).toHaveBeenCalledWith('/chat', { replace: true })
  })

  it('should navigate to /login if not authenticated and on the root path', () => {
    const mockNavigate = vi.fn()
    ;(useLocation as Mock).mockReturnValue({ pathname: '/' })
    ;(useNavigate as Mock).mockReturnValue(mockNavigate)
    ;(useAuthState as Mock).mockReturnValue(false)

    renderHook(() => useAuthRedirect())

    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true })
  })

  it('should navigate to / if authenticated and on a guest route', () => {
    const mockNavigate = vi.fn()
    ;(useLocation as Mock).mockReturnValue({ pathname: '/login' })
    ;(useNavigate as Mock).mockReturnValue(mockNavigate)
    ;(useAuthState as Mock).mockReturnValue(true)

    renderHook(() => useAuthRedirect())

    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
  })

  it('should navigate to /login if not authenticated and on a protected route', () => {
    const mockNavigate = vi.fn()
    ;(useLocation as Mock).mockReturnValue({ pathname: '/chat' })
    ;(useNavigate as Mock).mockReturnValue(mockNavigate)
    ;(useAuthState as Mock).mockReturnValue(false)

    renderHook(() => useAuthRedirect())

    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true })
  })

  it('should not navigate if the conditions are not met', () => {
    const mockNavigate = vi.fn()
    ;(useLocation as Mock).mockReturnValue({ pathname: '/chat' })
    ;(useNavigate as Mock).mockReturnValue(mockNavigate)
    ;(useAuthState as Mock).mockReturnValue(true)

    renderHook(() => useAuthRedirect())

    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
