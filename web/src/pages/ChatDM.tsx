import { PageLoader } from '@/components/PageLoader'
import { ChatHeader } from '@/features/chat/components'
import { MessageContainer } from '@/features/message/components'
import { fetchUser } from '@/features/user/user.service'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

export const Component = () => {
  const params = useParams<{ partnerId: string }>()

  const partnerId = Number(params.partnerId)

  const {
    data: receiver,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['user', partnerId],
    queryFn: ({ queryKey }) => fetchUser(queryKey[1] as number),
    enabled: Boolean(partnerId),
  })

  if (isLoading) {
    return <PageLoader />
  }

  return (
    <>
      <div className='flex h-full flex-1 flex-col overflow-hidden'>
        <ChatHeader
          chatId={receiver?.id}
          chatName={receiver?.username}
          error={error}
        />
        <MessageContainer partnerId={partnerId} />
      </div>
    </>
  )
}

Component.displayName = 'ChatDM'
