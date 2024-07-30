import { stringToColor } from '@/utils/style'
import { memo } from 'react'

const getInitials = (name: string) => {
  const nameParts = name.split(' ')
  const initials = nameParts.map(part => part.charAt(0).toUpperCase()).join('')
  return initials.slice(0, 2) // Get the first two initials
}

interface AvatarProps {
  id: number
  name: string
}

export const Avatar = memo(({ name, id }: AvatarProps) => {
  if (!name) return null

  const initials = getInitials(name)
  const { bgColor, textColor } = stringToColor(name + id)

  const avatarStyle = {
    backgroundColor: bgColor,
    color: textColor,
  }

  return (
    <div
      aria-label={`Avatar of ${name}`}
      className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-base font-bold'
      style={avatarStyle}
    >
      {initials}
    </div>
  )
})
