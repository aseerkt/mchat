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

export const ArraySkeleton = ({
  length = 3,
  className,
}: {
  className?: string
  length?: number
}) => {
  return (
    <div className='flex flex-col gap-3'>
      {new Array(length).fill(0).map((_, i) => (
        <Skeleton key={i} className={className} />
      ))}
    </div>
  )
}
