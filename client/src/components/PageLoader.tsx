import { Logo } from './Logo'
import { Spinner } from './Spinner'

export const PageLoader = () => {
  return (
    <div className='flex h-screen w-screen flex-col items-center justify-center text-center'>
      <div className='mb-3 flex items-end'>
        <span className='animate-pulse'>
          <Logo />
        </span>
      </div>
      <div className='flex flex-col items-center justify-center text-center'>
        <Spinner />
        <p className='text-lg text-gray-600'>Loading...</p>
      </div>
    </div>
  )
}
