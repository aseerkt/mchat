import { AuthFormWrapper, SignUpForm } from '../features/auth/components'

export const Component = () => {
  return (
    <AuthFormWrapper title='Signup'>
      <SignUpForm />
    </AuthFormWrapper>
  )
}

Component.displayName = 'SignUp'
