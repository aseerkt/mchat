import { Dialog } from '@/components/Dialog'
import { Menu, MenuItem } from '@/components/Menu'
import { useConfirmDialog } from '@/hooks/useConfirmDialog'
import { useDisclosure } from '@/hooks/useDisclosure'
import { toast } from '@/hooks/useToast'
import { useMutation } from '@tanstack/react-query'
import { IMessage } from '../message.interface'
import { deleteMessage } from '../message.service'
import { MessageInfo } from './MessageInfo'
import { MessageItem } from './MessageItem'

export const MessageActions = ({
  message,
  anchorRef,
  onClose,
}: {
  message: IMessage
  anchorRef: React.RefObject<HTMLButtonElement>
  onClose: () => void
}) => {
  const {
    isOpen: isInfoDialogOpen,
    close: closeInfoDialog,
    open: openInfoDialog,
  } = useDisclosure()

  const { mutateAsync } = useMutation({ mutationFn: deleteMessage })

  const confirm = useConfirmDialog()

  const confirmDelete = () => {
    async function handleMessageDelete() {
      try {
        await mutateAsync(message.id)
        toast({ title: 'Message deleted', severity: 'success' })
      } catch (error) {
        toast({ title: (error as Error).message, severity: 'success' })
      }
    }

    confirm({
      title: 'Delete message!',
      description: (
        <div>
          <div className='rounded border py-3'>
            <MessageItem
              message={message}
              isCurrentUser={true}
              hasActionAnchor={false}
            />
          </div>
          <p className='mt-3 text-sm'>
            Are you sure you want delete this message?
          </p>
        </div>
      ),
      severity: 'error',
      onConfirm: handleMessageDelete,
    })
  }

  return (
    <>
      <Menu
        anchorRef={anchorRef}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        className='min-w-[120px]'
        role='menu'
        onBlur={onClose}
      >
        <MenuItem onSelect={openInfoDialog}>Info</MenuItem>
        <MenuItem onSelect={confirmDelete}>Delete</MenuItem>
      </Menu>
      <Dialog isOpen={isInfoDialogOpen} onClose={closeInfoDialog}>
        <MessageInfo message={message} />
      </Dialog>
    </>
  )
}
