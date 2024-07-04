import { isRouteErrorResponse, useRouteError } from 'react-router-dom'

export const ErrorFallback = () => {
  const error = useRouteError()

  let content

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      content = <div>This page doesn't exist!</div>
    }

    if (error.status === 401) {
      content = <div>You aren't authorized to see this</div>
    }

    if (error.status === 503) {
      content = <div>Looks like our API is down</div>
    }

    if (error.status === 418) {
      content = <div>🫖</div>
    }
  } else {
    content = (
      <div>
        {error instanceof Error ? error.message : 'Not sure what went wrong'}
      </div>
    )
  }

  return (
    <div className='flex h-screen w-screen flex-col items-center justify-center'>
      <h1 className='mb-3 text-3xl font-bold'>Oops - Something went wrong</h1>
      <div className='max-w-96 text-red-900'>{content}</div>
    </div>
  )
}
