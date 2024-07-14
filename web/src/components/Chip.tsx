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
        'inline-flex items-center rounded-full bg-cyan-400 py-1 pl-2 pr-1 text-sm',
        className,
      )}
    >
      {icon && <span className='mr-2'>{icon}</span>}
      <span className='mr-2'>{label}</span>
      {onDelete && (
        <button
          type='button'
          className='inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border-2 border-gray-700 font-bold hover:border-red-600 hover:text-red-600'
          aria-label='Delete chip'
          onClick={e => {
            console.log('chip x select', e)
            e.stopPropagation()
            onDelete()
          }}
        >
          &times;
        </button>
      )}
    </div>
  )
}

export default Chip
