import { FallbackProps } from 'react-error-boundary'

export const ErrorFallback = (props: FallbackProps) => {
  return (
    <div className='flex h-screen w-screen flex-col items-center justify-center'>
      <h1 className='mb-3 text-3xl font-bold'>Oops - Something went wrong</h1>
      <p>{props.error}</p>
    </div>
  )
}
