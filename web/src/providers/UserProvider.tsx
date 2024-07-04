import { useState } from 'react'
import { AuthContext, AuthPayload } from '../contexts/AuthContext'
import { decodeToken } from '../utils/token'

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [auth, setAuth] = useState<AuthPayload | undefined>(decodeToken())

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  )
}
