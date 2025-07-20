import type React from "react"
import { forwardRef } from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary"
  size?: "default" | "sm" | "lg"
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
          {
            "bg-yellow-400 text-gray-900 hover:bg-yellow-300 shadow-lg hover:shadow-yellow-400/25":
              variant === "default",
            "bg-gray-700 text-white hover:bg-gray-600 border border-gray-600 hover:border-gray-500":
              variant === "secondary",
          },
          {
            "h-12 px-6 text-base": size === "default",
            "h-9 px-3 text-sm": size === "sm",
            "h-14 px-8 text-lg": size === "lg",
          },
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button }
