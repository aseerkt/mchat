import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { useAuthSetter } from '@/hooks/useAuth'
import useForm from '@/hooks/useForm'
import { useToast } from '@/hooks/useToast'
import { setToken } from '@/utils/token'
import { isRequired } from '@/utils/validators'
import { useMutation } from '@tanstack/react-query'
import { NavLink } from 'react-router-dom'
import { ISignUpVariables, IUserResponse } from '../auth.interface'
import { signup } from '../auth.service'

const validators = {
  fullName: [isRequired('Full name is required')],
  username: [isRequired('Username is required')],
  password: [isRequired('Password is required')],
}

export const SignUpForm = () => {
  const { toast } = useToast()
  const setAuth = useAuthSetter()
  const { register, handleSubmit, errors } = useForm({
    initialValues: { fullName: '', username: '', password: '' },
  })

  const { mutate: signupUser, isPending } = useMutation<
    IUserResponse,
    Error,
    ISignUpVariables
  >({
    mutationFn: signup,
    onSuccess: data => {
      if (data.user && data.token) {
        setToken(data.token)
        setAuth(data.user)
        toast({ title: 'Sign up success', severity: 'success' })
      }
    },
    onError(error) {
      toast({ title: (error as Error).message, severity: 'error' })
    },
  })

  const onSubmit = handleSubmit(signupUser)

  return (
    <form className='flex flex-col gap-4' onSubmit={onSubmit}>
      <Input
        type='text'
        label='Full name'
        {...register('fullName', validators.fullName)}
        error={errors.fullName}
      />
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
      <Button type='submit' disabled={isPending}>
        Create account
      </Button>
      <small>
        Already have an account? <NavLink to='/login'>Login</NavLink>
      </small>
    </form>
  )
}
