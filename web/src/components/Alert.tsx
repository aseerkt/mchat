import { cva, VariantProps } from 'cva'

const alertVariants = cva('rounded ', {
  variants: {
    severity: {
      info: 'bg-blue-200 text-blue-800',
      success: 'bg-green-200 text-green-800',
      error: 'bg-red-200 text-red-800',
    },
    size: {
      sm: 'text-sm p-2',
      lg: 'text-base p-3',
    },
  },
  defaultVariants: {
    severity: 'info',
    size: 'lg',
  },
})

export const Alert = ({
  severity,
  size,
  className,
  children,
}: VariantProps<typeof alertVariants> & {
  className?: string
  children: React.ReactNode
}) => {
  return (
    <div className={alertVariants({ severity, size, className })}>
      <span>{children}</span>
    </div>
  )
}
