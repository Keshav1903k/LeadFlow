import * as React from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "danger" | "secondary"
  size?: "default" | "sm" | "lg" | "icon"
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variants = {
      default: "bg-[#0E7C66] text-white hover:bg-[#0B6654] shadow-sm",
      outline: "border border-[#E7E3DB] bg-white text-[#1A1A17] hover:bg-stone-50",
      ghost: "hover:bg-stone-100 text-[#5C5A54] hover:text-[#1A1A17]",
      danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
      secondary: "bg-stone-100 text-[#1A1A17] hover:bg-stone-200",
    }

    const sizes = {
      default: "h-9 px-4 py-2 text-sm",
      sm: "h-8 px-3 text-xs",
      lg: "h-10 px-6 text-base",
      icon: "h-8 w-8 p-0 flex items-center justify-center",
    }

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C66] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
