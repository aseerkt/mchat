import { IGroup } from '../group.interface'

export const JoinRoomItem = ({
  group,
  isChecked,
  toggleRoomCheck,
}: {
  group: IGroup
  isChecked: boolean
  toggleRoomCheck: (id: number, isChecked: boolean) => void
}) => (
  <li key={group.id}>
    <label
      className='inline-flex h-10 w-full cursor-pointer items-center justify-between px-3 font-bold hover:bg-gray-100'
      htmlFor={'group_' + group.id}
    >
      <span className='w-full'>{group.name}</span>
      <input
        id={'group_' + group.id}
        type='checkbox'
        checked={isChecked}
        onChange={e => {
          toggleRoomCheck(group.id, e.target.checked)
        }}
      />
    </label>
  </li>
)
