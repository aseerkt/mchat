import { Button } from '@/components/Button'
import { Dialog } from '@/components/Dialog'
import { Menu, MenuItem } from '@/components/Menu'
import { PageLoader } from '@/components/PageLoader'
import { ChatUser, Header } from '@/features/chat/components'
import {
  CreateGroupForm,
  JoinGroupsForm,
  UserGroupList,
} from '@/features/group/components'
import { CreateDMForm } from '@/features/message/components'
import { useDisclosure } from '@/hooks/useDisclosure'
import { useSocketConnect } from '@/hooks/useSocketConnect'
import { cn } from '@/utils/style'
import { PlusCircle } from 'lucide-react'
import { useRef, useState } from 'react'
import { Outlet, useParams } from 'react-router-dom'

const ChatScrollArea = ({ children }: { children: React.ReactNode }) => {
  const params = useParams()

  return (
    <div
      className={cn(
        'flex w-full flex-shrink-0 flex-col md:w-[280px] md:border-r-2',
        (params.groupId || params.partnerId) && 'hidden md:flex',
      )}
    >
      {children}
    </div>
  )
}

const createChatComponents = {
  'create:group': CreateGroupForm,
  'create:dm': CreateDMForm,
  'join:group': JoinGroupsForm,
}

type CreateChatComponentsKey = keyof typeof createChatComponents

const NewChatMenu = () => {
  const {
    isOpen: isMenuOpen,
    open: openMenu,
    close: closeMenu,
  } = useDisclosure()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [chatDialog, setChatDialog] = useState<CreateChatComponentsKey>()

  const setActiveChatDialog = (componentKey: CreateChatComponentsKey) => () => {
    setChatDialog(componentKey)
    closeMenu()
  }
  const closeChatDialog = () => setChatDialog(undefined)

  const NewChatComponent = chatDialog ? createChatComponents[chatDialog] : null

  return (
    <div className='flex shrink-0 flex-wrap justify-center gap-3 border-t px-3 py-4'>
      <Button
        type='button'
        className='inline-flex items-center gap-2'
        ref={buttonRef}
        onClick={openMenu}
      >
        <PlusCircle />
        New chat
      </Button>
      {isMenuOpen && (
        <Menu
          anchorFullWidth
          anchorRef={buttonRef}
          anchorOrigin={{
            horizontal: 'left',
            vertical: 'top',
          }}
          transformOrigin={{
            horizontal: 'left',
            vertical: 'bottom',
          }}
          onBlur={closeMenu}
        >
          <MenuItem onSelect={setActiveChatDialog('create:group')}>
            Create Group
          </MenuItem>
          <MenuItem onSelect={setActiveChatDialog('create:dm')}>
            Direct message
          </MenuItem>
          <MenuItem onSelect={setActiveChatDialog('join:group')}>
            Join Group
          </MenuItem>
        </Menu>
      )}
      <Dialog isOpen={Boolean(chatDialog)} onClose={closeChatDialog}>
        {NewChatComponent && <NewChatComponent onComplete={closeChatDialog} />}
      </Dialog>
    </div>
  )
}

export const Component = () => {
  const { isConnected } = useSocketConnect()

  if (!isConnected) {
    return <PageLoader />
  }

  return (
    <div className='flex h-screen w-screen flex-col overflow-hidden'>
      <Header />
      <div className='flex flex-1 overflow-hidden'>
        <ChatScrollArea>
          <ChatUser isConnected={isConnected} />
          <UserGroupList />
          <NewChatMenu />
        </ChatScrollArea>
        <div className='flex h-full flex-1 overflow-hidden'>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

Component.displayName = 'ChatLayout'
