import { Logo } from '@/components/Logo'
import clsx from 'clsx'
import { Outlet, useLocation } from 'react-router-dom'

const pathConfigs = {
  '/auth/login': {
    title: 'Login',
    position: 'left',
  },
  '/auth/signup': {
    title: 'Sign up',
    position: 'right',
  },
}

const AuthFormWrapper = () => {
  const location = useLocation()

  const { title, position } =
    pathConfigs[location.pathname as keyof typeof pathConfigs]

  return (
    <div className='flex h-screen w-screen flex-col items-center justify-center bg-gradient-to-tr from-cyan-400 to-cyan-50'>
      <div className='relative flex h-[510px] w-full max-w-[700px] overflow-hidden rounded-lg shadow-md'>
        <img
          className='absolute h-full w-full'
          src='https://images.pexels.com/photos/911738/pexels-photo-911738.jpeg?auto=compress&cs=tinysrgb&w=720&h=530&dpr=1'
          alt='patterns'
        />
        <section
          className={clsx(
            'absolute inset-y-0 left-0 z-10 h-full w-full max-w-[350px] rounded-lg border bg-white p-6 shadow-md transition-transform',
            position === 'left' ? 'translate-x-0' : 'translate-x-full',
          )}
        >
          <div className='text-center'>
            <Logo />
            <h2 className='mb-6 mt-2 text-xl font-bold'>{title}</h2>
          </div>
          <Outlet />
        </section>
      </div>
    </div>
  )
}

export default AuthFormWrapper
