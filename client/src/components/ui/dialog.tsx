import * as React from "react"
import { X } from "lucide-react"

interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
}: DialogProps) {
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && open) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Content */}
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-[#E7E3DB] z-10 transition-all">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold font-heading text-[#1A1A17]">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm text-[#5C5A54]">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-[#5C5A54] hover:bg-stone-100 hover:text-[#1A1A17] transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-5">{children}</div>
      </div>
    </div>
  )
}
