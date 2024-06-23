import backArrow from '../../../assets/back-svgrepo-com.svg'
import { MemberList } from './MemberList'

interface MembersListProps {
  isOpen: boolean
  onClose: () => void
  roomId: string
}

export const MembersSidebar = (props: MembersListProps) => {
  return props.isOpen ? (
    <div className='h-full w-full overflow-y-hidden border-l md:w-[260px]'>
      <header className='flex h-14 items-center border-b px-4'>
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
        <h3>Members</h3>
      </header>
      <MemberList key={props.isOpen ? 'true' : 'false'} roomId={props.roomId} />
    </div>
  ) : null
}
