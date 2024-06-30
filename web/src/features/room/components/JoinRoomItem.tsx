import { IRoom } from '../room.interface'

export const JoinRoomItem = ({
  room,
  isChecked,
  toggleRoomCheck,
}: {
  room: IRoom
  isChecked: boolean
  toggleRoomCheck: (id: string, isChecked: boolean) => void
}) => (
  <li key={room._id}>
    <label
      className='inline-flex h-10 w-full cursor-pointer items-center justify-between px-3 font-bold hover:bg-gray-100'
      htmlFor={room._id}
    >
      <span className='w-full'>{room.name}</span>
      <input
        id={room._id}
        type='checkbox'
        checked={isChecked}
        onChange={e => {
          toggleRoomCheck(room._id, e.target.checked)
        }}
      />
    </label>
  </li>
)
