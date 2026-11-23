import * as React from "react"
import { X } from "lucide-react"
import { cn } from "../../lib/utils"

interface SheetProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
}

export function Sheet({
  open,
  onClose,
  title,
  description,
  children,
}: SheetProps) {
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && open) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, onClose])

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Slide-over Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-full sm:max-w-md bg-white border-l border-[#E7E3DB] shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#E7E3DB] flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold font-heading text-[#1A1A17]">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm text-[#5C5A54]">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#5C5A54] hover:bg-stone-100 hover:text-[#1A1A17] transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </>
  )
}
