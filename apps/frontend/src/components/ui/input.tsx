import React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'flex h-10 w-full border border-border bg-canvas px-3 py-2 text-sm text-ink placeholder:text-muted',
        'focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-transparent',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'transition-colors',
        className
      )}
      {...props}
    />
  )
}
