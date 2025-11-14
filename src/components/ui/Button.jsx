import React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 hover:scale-105 relative overflow-hidden group",
  {
    variants: {
      variant: {
        primary: "bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white hover:from-primary-600 hover:via-primary-700 hover:to-primary-800 shadow-2xl shadow-primary-500/40 hover:shadow-primary-600/50 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity",
        secondary: "bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 text-white hover:from-purple-600 hover:via-purple-700 hover:to-purple-800 shadow-2xl shadow-purple-500/40 hover:shadow-purple-600/50",
        outline: "border-3 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 shadow-lg hover:shadow-xl",
        ghost: "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 shadow-none",
        danger: "bg-gradient-to-br from-red-500 via-red-600 to-red-700 text-white hover:from-red-600 hover:via-red-700 hover:to-red-800 shadow-2xl shadow-red-500/40",
        success: "bg-gradient-to-br from-green-500 via-green-600 to-green-700 text-white hover:from-green-600 hover:via-green-700 hover:to-green-800 shadow-2xl shadow-green-500/40",
      },
      size: {
        sm: "h-11 px-5 text-sm min-h-[44px] rounded-2xl",
        md: "h-12 px-6 py-3 min-h-[48px] text-base rounded-2xl",
        lg: "h-14 px-8 text-lg min-h-[56px] rounded-2xl",
        icon: "h-12 w-12 min-h-[48px] min-w-[48px] rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

const Button = React.forwardRef(({
  className,
  variant,
  size,
  children,
  loading,
  ...props
}, ref) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  )
})

Button.displayName = "Button"

export { Button, buttonVariants }
