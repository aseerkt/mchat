import { memo } from 'react'

const stringToColor = (str: string) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }

  hash = Math.abs(hash)

  const r = (hash & 0xff0000) >> 16
  const g = (hash & 0x00ff00) >> 8
  const b = hash & 0x0000ff

  const bgColor = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`

  // Calculate luminance to determine appropriate text color
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  const textColor = luminance > 0.5 ? '#000000' : '#FFFFFF'

  return { bgColor, textColor }
}

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
