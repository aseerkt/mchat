import { createPortal } from 'react-dom'

interface DialogProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export const Dialog = ({ isOpen, onClose, children }: DialogProps) => {
  return isOpen
    ? createPortal(
        <div role='presentation' className='fixed inset-0 z-10'>
          <div
            aria-hidden='true'
            className='fixed inset-0 bg-black bg-opacity-80'
            onClick={onClose}
          ></div>
          <div
            role='presentation'
            className='flex h-full w-full items-center justify-center'
          >
            <div
              role='dialog'
              aria-modal='true'
              className='z-20 min-h-60 w-full max-w-[500px] shrink-0 rounded border bg-white p-6 shadow-md'
            >
              {children}
            </div>
          </div>
        </div>,
        document.body,
      )
    : null
}
