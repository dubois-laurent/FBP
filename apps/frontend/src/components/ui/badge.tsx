import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center px-2.5 py-0.5 text-xs font-medium tracking-wide uppercase',
  {
    variants: {
      variant: {
        default: 'bg-cobalt text-canvas',
        outline: 'border border-cobalt text-cobalt',
        surface: 'bg-surface text-muted',
        success: 'bg-green-100 text-green-800',
        destructive: 'bg-red-100 text-red-800',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
