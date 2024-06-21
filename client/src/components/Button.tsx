import { cva, VariantProps } from 'cva'
import { cn } from '../utils/style'

const buttonVariants = cva('rounded-lg border-2 border-black', {
  variants: {
    variant: {
      primary: 'bg-black text-white',
      secondary: 'bg-white text-black',
    },
    size: {
      sm: 'h-8 px-2',
      lg: 'h-10 px-3',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'lg',
  },
})

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>

export const Button = ({ className, variant, size, ...props }: ButtonProps) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}
