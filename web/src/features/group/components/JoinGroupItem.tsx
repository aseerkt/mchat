import { IGroup } from '../group.interface'

export const JoinRoomItem = ({
  room,
  isChecked,
  toggleRoomCheck,
}: {
  room: IGroup
  isChecked: boolean
  toggleRoomCheck: (id: number, isChecked: boolean) => void
}) => (
  <li key={room.id}>
    <label
      className='inline-flex h-10 w-full cursor-pointer items-center justify-between px-3 font-bold hover:bg-gray-100'
      htmlFor={room.id}
    >
      <span className='w-full'>{room.name}</span>
      <input
        id={room.id}
        type='checkbox'
        checked={isChecked}
        onChange={e => {
          toggleRoomCheck(room.id, e.target.checked)
        }}
      />
    </label>
  </li>
)
