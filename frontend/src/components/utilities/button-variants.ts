import { cva } from 'class-variance-authority'

export const buttonVariants = cva(
  'inline-flex h-10 items-center justify-center gap-2 rounded-app border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-55',
  {
    defaultVariants: {
      size: 'default',
      variant: 'primary'
    },
    variants: {
      size: {
        default: 'h-10 px-4',
        icon: 'h-10 w-10 px-0',
        sm: 'h-9 px-3 text-xs'
      },
      variant: {
        danger: 'border-accent-red bg-accent-red text-white hover:bg-accent-red/90',
        ghost: 'border-transparent bg-transparent text-text hover:bg-muted',
        primary: 'border-primary bg-primary text-white hover:bg-primary-hover',
        secondary: 'border-border bg-surface text-text hover:bg-muted'
      }
    }
  }
)
