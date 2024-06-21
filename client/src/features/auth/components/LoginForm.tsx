import { NavLink } from 'react-router-dom'
import { Button } from '../../../components/Button'
import { Input } from '../../../components/Input'
import { useAuthSetter } from '../../../hooks/useAuth'
import useForm from '../../../hooks/useForm'
import { useMutation } from '../../../hooks/useMutation'
import { useToast } from '../../../hooks/useToast'
import { User } from '../../../interfaces/user.interface'
import { setToken } from '../../../utils/token'
import { isRequired } from '../../../utils/validators'

interface LoginResponse {
  user: User
  token: string
}

interface LoginVariables {
  username: string
  password: string
}

const validators = {
  username: [isRequired('Username is required')],
  password: [isRequired('Password is required')],
}

export const LoginForm = () => {
  const { toast } = useToast()
  const setAuth = useAuthSetter()
  const { register, handleSubmit, errors } = useForm({
    initialValues: { username: '', password: '' },
  })

  const { mutate: login, loading } = useMutation<LoginResponse, LoginVariables>(
    '/api/users/login',
    { method: 'POST' },
  )

  const onSubmit = handleSubmit(async values => {
    try {
      const result = await login(values)
      if (result?.user && result.token) {
        setToken(result.token)
        setAuth(result.user)
        toast({ title: 'Login success', severity: 'success' })
      }
    } catch (error) {
      toast({ title: (error as Error).message, severity: 'error' })
    }
  })

  return (
    <form className='flex flex-col gap-4' onSubmit={onSubmit}>
      <Input
        type='text'
        label='Username'
        autoComplete='username'
        {...register('username', validators.username)}
        error={errors.username}
      />
      <Input
        type='password'
        label='Password'
        autoComplete='current-password'
        {...register('password', validators.password)}
        error={errors.password}
      />
      <Button type='submit' disabled={loading}>
        Continue
      </Button>
      <small>
        Don't have account? <NavLink to='/signup'>Create account</NavLink>
      </small>
    </form>
  )
}
