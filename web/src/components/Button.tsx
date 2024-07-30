import { cva, VariantProps } from 'cva'
import { forwardRef } from 'react'
import { cn } from '../utils/style'

const buttonVariants = cva(
  'rounded-lg  border-2 border-black disabled:bg-gray-300',
  {
    variants: {
      variant: {
        primary: 'bg-black text-white',
        secondary: 'bg-white text-black',
      },
      size: {
        sm: 'h-8 px-2',
        lg: 'h-10 px-3',
      },
      color: {
        default: '',
        info: 'border-blue-500',
        error: 'border-red-500',
        success: 'border-green-500',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'lg',
      color: 'default',
    },
    compoundVariants: [
      {
        variant: 'primary',
        color: 'error',
        class: 'bg-red-500',
      },
      {
        variant: 'secondary',
        color: 'error',
        class: 'text-red-500',
      },
      {
        variant: 'primary',
        color: 'success',
        class: 'bg-green-500',
      },
      {
        variant: 'secondary',
        color: 'success',
        class: 'text-green-500 ',
      },
      {
        variant: 'primary',
        color: 'success',
        class: 'bg-blue-500',
      },
      {
        variant: 'secondary',
        color: 'success',
        class: 'text-blue-500 ',
      },
    ],
  },
)

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, color, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, color }), className)}
        {...props}
      />
    )
  },
)
