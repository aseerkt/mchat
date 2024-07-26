import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { useAuthSetter } from '@/hooks/useAuth'
import useForm from '@/hooks/useForm'
import { useToast } from '@/hooks/useToast'
import { accessToken } from '@/utils/token'
import { isRequired } from '@/utils/validators'
import { useMutation } from '@tanstack/react-query'
import { NavLink } from 'react-router-dom'
import { ILoginVariables, IUserResponse } from '../auth.interface'
import { login } from '../auth.service'

const validators = {
  username: [isRequired('Username is required')],
  password: [isRequired('Password is required')],
}

export const LoginForm = () => {
  const { toast } = useToast()
  const { setAuth } = useAuthSetter()
  const { register, handleSubmit, errors } = useForm({
    initialValues: { username: '', password: '' },
  })

  const { mutate: loginUser, isPending } = useMutation<
    IUserResponse,
    Error,
    ILoginVariables
  >({
    mutationFn: login,
    onSuccess(data) {
      if (data.user && data.token) {
        accessToken.set(data.token)
        setAuth(data)
        toast({ title: 'Login success', severity: 'success' })
      }
    },
    onError(error) {
      toast({ title: error.message, severity: 'error' })
    },
  })

  const onSubmit = handleSubmit(loginUser)

  return (
    <form className='flex flex-col gap-4' onSubmit={onSubmit}>
      <Input
        type='text'
        label='Username'
        autoComplete='username'
        {...register('username', validators.username)}
        error={errors.username}
        autoFocus
      />
      <Input
        type='password'
        label='Password'
        autoComplete='current-password'
        {...register('password', validators.password)}
        error={errors.password}
      />
      <Button type='submit' disabled={isPending}>
        Continue
      </Button>
      <small>
        Don't have account?{' '}
        <NavLink className='text-blue-700' to='/auth/signup'>
          Create account
        </NavLink>
      </small>
    </form>
  )
}
