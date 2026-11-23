import * as React from "react"
import { cn } from "../../lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, type, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          type={type}
          ref={ref}
          className={cn(
            "flex h-9 w-full rounded-lg border border-[#E7E3DB] bg-white px-3 py-1 text-sm text-[#1A1A17] placeholder:text-[#8A8880] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0E7C66] focus-visible:border-[#0E7C66] disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
            error && "border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-red-600">{error}</p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"
