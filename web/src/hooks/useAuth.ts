import { useContext } from 'react'
import { AuthContext, AuthDispatchContext } from '../contexts/AuthContext'

export const useAuthState = () => useContext(AuthContext)
export const useAuthSetter = () => useContext(AuthDispatchContext)
