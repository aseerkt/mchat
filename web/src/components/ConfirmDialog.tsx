import { toast } from '@/hooks/useToast'
import { createContext, useCallback, useState } from 'react'
import { Button } from './Button'
import { Dialog } from './Dialog'

type ConfirmDialogState = {
  title: React.ReactNode
  description: React.ReactNode
  severity: 'success' | 'info' | 'error'
  onConfirm: () => void | Promise<void>
}

type ConfirmDialogContextType = (state: ConfirmDialogState) => void

export const ConfirmDialogContext = createContext<ConfirmDialogContextType>(
  () => {},
)

export const ConfirmDialogProvider = ({
  children,
}: React.PropsWithChildren) => {
  const [state, setState] = useState<ConfirmDialogState | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const closeConfirm = useCallback(() => setState(null), [])
  const confirm = useCallback((state: ConfirmDialogState) => {
    setState(state)
    return closeConfirm
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!state) return
    setIsSubmitting(true)
    try {
      await state.onConfirm()
      closeConfirm()
    } catch (error) {
      toast({ title: (error as Error).message, severity: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ConfirmDialogContext.Provider value={confirm}>
      {children}
      <Dialog isOpen={Boolean(state)} onClose={closeConfirm}>
        <form
          aria-disabled={!state}
          hidden={!state}
          className='flex flex-col'
          onSubmit={handleSubmit}
        >
          <h1 className='mb-2 text-xl font-bold'>{state?.title}</h1>
          <div>{state?.description}</div>
          <div className='mt-4 flex justify-end gap-2'>
            <Button
              variant='secondary'
              autoFocus
              type='button'
              onClick={closeConfirm}
            >
              Cancel
            </Button>
            <Button
              disabled={!state || isSubmitting}
              variant='primary'
              color={state?.severity}
            >
              Confirm
            </Button>
          </div>
        </form>
      </Dialog>
    </ConfirmDialogContext.Provider>
  )
}
