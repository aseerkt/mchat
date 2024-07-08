import backArrow from '@/assets/back-svgrepo-com.svg'

interface MembersListProps {
  isOpen: boolean
  onClose: () => void
  groupId: number
  children: React.ReactNode
}

export const GroupInfo = (props: MembersListProps) => {
  return props.isOpen ? (
    <div className='flex h-full w-full flex-col overflow-y-hidden border-l md:w-[260px]'>
      <header className='flex h-14 shrink-0 items-center border-b px-4'>
        <button
          onClick={props.onClose}
          aria-label='close member drawer'
          className='mr-4 inline-flex shrink-0 md:hidden'
        >
          <img
            className='h-4 w-4'
            src={backArrow}
            alt='back-arrow'
            height={20}
            width={20}
          />
        </button>
        <h3 className='font-semibold'>Group info</h3>
      </header>
      {props.children}
    </div>
  ) : null
}
