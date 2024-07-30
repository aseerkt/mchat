import { TypingIndicator } from '@/features/chat/components'
import { useCallback, useState } from 'react'
import { IMessage } from '../message.interface'
import { MessageComposer } from './MessageComposer'
import { MessageList } from './MessageList'

export const MessageContainer = ({
  groupId,
  partnerId,
}: {
  groupId?: number
  partnerId?: number
}) => {
  const [replyMessage, setReplyMessage] = useState<IMessage>()

  const handleReplyMessage = useCallback(
    (message: IMessage) => setReplyMessage(message),
    [],
  )

  const unsetReplyMessage = useCallback(() => setReplyMessage(undefined), [])

  return (
    <>
      <MessageList
        groupId={groupId}
        partnerId={partnerId}
        onReplyAction={handleReplyMessage}
      />
      <TypingIndicator />
      <MessageComposer
        groupId={groupId}
        receiverId={partnerId}
        replyMessage={replyMessage}
        cancelReply={unsetReplyMessage}
      />
    </>
  )
}
