import { Logo } from '@/components/Logo'

interface AuthFormWrapperProps {
  title: React.ReactNode
  children: React.ReactNode
}

export const AuthFormWrapper: React.FC<AuthFormWrapperProps> = ({
  children,
  title,
}) => {
  return (
    <div className='flex h-screen w-screen flex-col items-center justify-center'>
      <div className='h-fit w-full max-w-[350px] rounded-md border p-6 shadow-md'>
        <div className='text-center'>
          <Logo />
          <h2 className='mb-6 mt-2 text-xl font-bold'>{title}</h2>
        </div>
        {children}
      </div>
    </div>
  )
}
