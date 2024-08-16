import { stringToColor } from '@/utils/style'
import { cva, VariantProps } from 'cva'
import { memo } from 'react'

const getInitials = (name: string) => {
  const nameParts = name.split(' ')
  const initials = nameParts.map(part => part.charAt(0).toUpperCase()).join('')
  return initials.slice(0, 2) // Get the first two initials
}
const avatarVariants = cva(
  'flex shrink-0 items-center justify-center rounded-full border font-bold',
  {
    variants: {
      size: {
        sm: 'h-10 w-10 text-base',
        lg: 'h-16 w-16 text-lg',
        xl: 'h-28 w-28 text-3xl',
      },
    },
    defaultVariants: {
      size: 'sm',
    },
  },
)

type AvatarProps = VariantProps<typeof avatarVariants> & {
  id: number
  name: string
}

export const Avatar = memo(({ name, id, size }: AvatarProps) => {
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
      className={avatarVariants({ size })}
      style={avatarStyle}
    >
      {initials}
    </div>
  )
})
