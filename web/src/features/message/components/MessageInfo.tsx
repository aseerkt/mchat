import { Alert } from '@/components/Alert'
import { ArraySkeleton } from '@/components/Skeleton'
import { useQuery } from '@tanstack/react-query'
import { CheckCheck } from 'lucide-react'
import { IMessage } from '../message.interface'
import { fetchMessageRecipients } from '../message.service'
import { MessageItem } from './MessageItem'

export const MessageInfo = ({ message }: { message: IMessage }) => {
  const {
    data: recipients,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['messages', message.id, 'recipients'],
    queryFn: ({ queryKey }) => fetchMessageRecipients(queryKey[1] as number),
  })

  let content

  if (isLoading) {
    content = <ArraySkeleton length={5} className='h-8 w-full' />
  } else if (error) {
    content = <Alert severity='error'>{error.message}</Alert>
  } else if (recipients?.length) {
    content = recipients.map(recipient => (
      <li key={recipient.userId}>
        <div className='px-3 py-2'>
          <div>
            <b>{recipient.username}</b>{' '}
            <span className='text-gray-500'>({recipient.fullName})</span>
          </div>
        </div>
      </li>
    ))
  } else {
    content = <Alert severity='info'>Message is not seen by anyone</Alert>
  }

  return (
    <div>
      <h2 className='mb-3 text-lg font-bold'>Message info</h2>
      <div className='rounded border py-3'>
        <MessageItem
          message={message}
          isCurrentUser={true}
          hasActionAnchor={false}
        />
      </div>
      <div className='mt-3 rounded border'>
        <div className='inline-flex w-full items-center justify-between border-b px-3 py-2'>
          <b className='font-bold text-green-800'>Seen by</b>
          <CheckCheck size={18} className='text-blue-500' />
        </div>
        <ul className='flex flex-col overflow-auto'>{content}</ul>
      </div>
    </div>
  )
}
