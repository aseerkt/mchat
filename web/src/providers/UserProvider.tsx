import { useState } from 'react'
import {
  AuthContext,
  AuthDispatchContext,
  type Auth,
} from '../contexts/AuthContext'
import { decodeToken } from '../utils/token'

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [auth, setAuth] = useState<Auth>(decodeToken())

  return (
    <AuthDispatchContext.Provider value={setAuth}>
      <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
    </AuthDispatchContext.Provider>
  )
}
