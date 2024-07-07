import { cn } from '@/utils/style'

type ChipProps = {
  label: React.ReactNode
  onDelete: () => void
  icon?: React.ReactNode
  className?: string
}

const Chip = ({ label, onDelete, icon, className }: ChipProps) => {
  return (
    <div
      className={cn(
        'm-1 inline-flex items-center rounded-full bg-blue-200 px-2 py-1 text-sm',
        className,
      )}
    >
      {icon && <span className='mr-2'>{icon}</span>}
      <span className='mr-2'>{label}</span>
      {onDelete && (
        <button
          className='cursor-pointer font-bold hover:text-red-600'
          role='button'
          aria-label='Delete chip'
          onClick={onDelete}
        >
          &times;
        </button>
      )}
    </div>
  )
}

export default Chip
