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

export const Component = () => {
  const location = useLocation()

  const { title, position } =
    pathConfigs[location.pathname as keyof typeof pathConfigs]

  return (
    <div className='flex h-screen w-screen flex-col items-center justify-center bg-gradient-to-tr from-cyan-400 to-cyan-50'>
      <div className='relative flex h-[610px] w-full max-w-[350px] items-center overflow-hidden rounded-lg shadow-md md:h-[510px] md:max-w-[700px]'>
        <img
          className='absolute h-full w-full'
          src='/patterns.webp'
          alt='patterns'
        />
        <section
          className={clsx(
            'absolute left-0 z-10 h-[510px] w-full max-w-[350px] rounded-lg border bg-white p-6 shadow-md transition-transform',
            position === 'right' && 'md:translate-x-full',
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

Component.displayName = 'AuthFormWrapper'
