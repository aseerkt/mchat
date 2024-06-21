import { VariantProps, cva } from 'cva'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'

const toastVariants = cva(
  'fixed flex justify-between gap-4 min-w-[200px] shadow-lg border rounded p-3 bottom-6 z-10 transition-all',
  {
    variants: {
      severity: {
        error: 'text-red-700 border-red-300',
        info: 'text-indigo-700',
        success: 'text-green-800',
      },
      state: {
        open: 'right-6',
        close: '-right-full',
      },
    },
    defaultVariants: {
      state: 'close',
      severity: 'info',
    },
  },
)

export type ToastVariantProps = Omit<
  VariantProps<typeof toastVariants>,
  'state'
>

type ToastProps = ToastVariantProps & {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export const Toast: React.FC<ToastProps> = ({
  open,
  onOpenChange,
  severity,
  children,
}) => {
  const handleClose = () => onOpenChange(false)

  useEffect(() => {
    if (open) {
      const timeout = setTimeout(handleClose, 3000)
      return () => {
        clearTimeout(timeout)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return createPortal(
    <div
      className={toastVariants({ severity, state: open ? 'open' : 'close' })}
    >
      <>{children}</>
      <button
        aria-label='close toast'
        className='inline-flex h-5 w-5 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100'
        onClick={handleClose}
      >
        x
      </button>
    </div>,
    document.body,
  )
}
