import { AuthFormWrapper, LoginForm } from '../features/auth/components'

export const Component = () => {
  return (
    <AuthFormWrapper title='Login'>
      <LoginForm />
    </AuthFormWrapper>
  )
}

Component.displayName = 'Login'
