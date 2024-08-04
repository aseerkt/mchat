import { cn, stringToColor } from '@/utils/style'
import { CircleSlash } from 'lucide-react'

export const MessageReplyItem = ({
  username,
  content,
  isDeleted = false,
}: {
  username: string
  content: string
  isDeleted?: boolean
}) => {
  return (
    <div className='flex flex-1 gap-2 overflow-hidden rounded-md border bg-gray-100 pr-2 shadow-inner'>
      <div className='min-h-full w-1 bg-gray-500'></div>
      <div className='py-2'>
        <b style={{ color: stringToColor(username).bgColor }}>{username}</b>
        <div
          className={cn(
            'flex items-center gap-2',
            isDeleted && 'text-sm text-gray-500',
          )}
        >
          {isDeleted && <CircleSlash size={16} className='text-gray-500' />}
          <p>{content}</p>
        </div>
      </div>
    </div>
  )
}
