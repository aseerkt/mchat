import { useRef } from 'react'
import { createPortal } from 'react-dom'
import { useClickOutside } from '../hooks/useClickOutside'
import { cn } from '../utils/style'

interface DialogProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export const Dialog = ({ isOpen, onClose, children }: DialogProps) => {
  const dialogRef = useRef<HTMLDivElement>(null)

  useClickOutside(dialogRef, onClose)

  return isOpen
    ? createPortal(
        <div
          aria-label='dialog_overlay '
          className={cn(
            'fixed top-0 z-20 flex h-screen w-screen items-center justify-center bg-black bg-opacity-80',
            !isOpen && 'hidden',
          )}
        >
          <div
            ref={dialogRef}
            role='dialog'
            aria-modal='true'
            className='border-3 w-full max-w-[500px] shrink-0 rounded bg-white p-6 shadow-md'
          >
            {children}
          </div>
        </div>,
        document.body,
      )
    : null
}
