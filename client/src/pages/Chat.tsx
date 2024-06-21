export const Component = () => {
  return (
    <div className='flex flex-1 flex-col items-center justify-center text-center'>
      <span className='mb-4 inline-block text-5xl'>{'<--'} 💬</span>
      <p className='text-gray-500'>Please select a chat to continue</p>
    </div>
  )
}

Component.displayName = 'Chat'
