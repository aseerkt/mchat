import { cva, VariantProps } from 'cva'
import { forwardRef } from 'react'
import { cn } from '../utils/style'

const inputVariants = cva('rounded w-full p-2 border', {
  variants: {
    variant: {
      primary: '',
      secondary: '',
    },
    size: {
      sm: 'h-8',
      lg: 'h-10',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'lg',
  },
})

type InputProps = React.InputHTMLAttributes<HTMLInputElement> &
  VariantProps<typeof inputVariants> & {
    label?: React.ReactNode
    error?: string
  }

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, label, error, ...props }, ref) => {
    return (
      <div className='h-20'>
        {label && <label htmlFor={props.name}>{label}</label>}
        <input
          ref={ref}
          className={cn(inputVariants({ variant, size }), className)}
          {...props}
          id={props.name}
          aria-invalid={Boolean(error)}
        />
        {error && (
          <small className='mt-1 block text-xs text-red-500'>{error}</small>
        )}
      </div>
    )
  },
)
