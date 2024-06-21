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

  return createPortal(
    <div
      aria-label='dialog_overlay'
      className={cn(
        'fixed flex h-screen w-screen items-center justify-center',
        isOpen && 'hidden',
      )}
    >
      <div ref={dialogRef} role='dialog' aria-modal='true'>
        {children}
      </div>
    </div>,
    document.body,
  )
}
