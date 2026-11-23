import { ChevronDown, Check } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { LeadStatus } from "../types/lead"
import { leadStatuses } from "../lib/validation"
import { cn } from "../lib/utils"

interface StatusBadgeProps {
  status: LeadStatus
  onStatusChange?: (newStatus: LeadStatus) => void
  disabled?: boolean
}

const statusConfig: Record<
  LeadStatus,
  { label: string; dotColor: string }
> = {
  New: {
    label: "New",
    dotColor: "bg-[#64748B]",
  },
  Contacted: {
    label: "Contacted",
    dotColor: "bg-[#D97706]",
  },
  Qualified: {
    label: "Qualified",
    dotColor: "bg-[#0E7C66]",
  },
  Lost: {
    label: "Lost",
    dotColor: "bg-[#B91C1C]",
  },
}

export function StatusBadge({
  status,
  onStatusChange,
  disabled = false,
}: StatusBadgeProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const current = statusConfig[status] || statusConfig.New

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled || !onStatusChange}
        onClick={() => onStatusChange && setIsOpen(!isOpen)}
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-[#1A1A17] hover:bg-stone-100 transition-colors cursor-pointer",
          !onStatusChange && "cursor-default hover:bg-transparent"
        )}
        title="Change status"
      >
        <span
          className={cn("w-2 h-2 rounded-full flex-shrink-0", current.dotColor)}
        />
        <span>{current.label}</span>
        {onStatusChange && (
          <ChevronDown className="w-3 h-3 text-[#5C5A54] ml-0.5" />
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 w-36 rounded-lg bg-white border border-[#E7E3DB] shadow-lg py-1 z-30 focus:outline-none">
          {leadStatuses.map((s) => {
            const cfg = statusConfig[s]
            const isSelected = s === status
            return (
              <button
                key={s}
                type="button"
                onClick={() => {
                  onStatusChange?.(s)
                  setIsOpen(false)
                }}
                className={cn(
                  "w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-stone-50 transition-colors",
                  isSelected && "font-medium text-[#0E7C66]"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className={cn("w-2 h-2 rounded-full", cfg.dotColor)} />
                  <span>{cfg.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#0E7C66]" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
