import { cva, VariantProps } from 'cva'

const alertVariants = cva('min-h-8 rounded p-3', {
  variants: {
    severity: {
      info: 'bg-blue-200 text-blue-800',
      success: 'bg-green-200 text-green-800',
      error: 'bg-red-200 text-red-800',
    },
  },
  defaultVariants: {
    severity: 'info',
  },
})

export const Alert = ({
  severity,
  className,
  children,
}: VariantProps<typeof alertVariants> & {
  className?: string
  children: React.ReactNode
}) => {
  return (
    <div className={alertVariants({ severity, className })}>
      <span>{children}</span>
    </div>
  )
}
