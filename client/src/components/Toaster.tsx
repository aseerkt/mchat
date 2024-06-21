import { useToast } from '../hooks/useToast'
import { Toast } from './Toast'

export const Toaster = () => {
  const { toasts } = useToast()

  return (
    <>
      {toasts.map(function ({ id, title, description, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className='grid gap-1'>
              {title && <span>{title}</span>}
              {description && <p>{description}</p>}
            </div>
          </Toast>
        )
      })}
    </>
  )
}
