import { cn } from '../utils/style'

export const Skeleton = ({ className }: { className?: string }) => {
  return (
    <div
      aria-label='loading-skeleton'
      className={cn(
        'w-full shrink-0 animate-pulse rounded bg-gray-300',
        className,
      )}
    ></div>
  )
}
