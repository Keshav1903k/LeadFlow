import { Search, Plus, Menu } from "lucide-react"
import { Button } from "./ui/button"

interface TopBarProps {
  title: string
  onOpenMobileMenu?: () => void
  onAddLeadClick?: () => void
  searchQuery?: string
  onSearchChange?: (val: string) => void
}

export function TopBar({
  title,
  onOpenMobileMenu,
  onAddLeadClick,
  searchQuery,
  onSearchChange,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 h-16 bg-[#F7F5F0]/90 backdrop-blur border-b border-[#E7E3DB] px-4 md:px-8 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="p-2 -ml-2 rounded-lg text-[#5C5A54] hover:bg-stone-200/60 md:hidden"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-sm font-medium text-[#1A1A17]">{title}</span>
      </div>

      <div className="flex items-center gap-3">
        {onSearchChange !== undefined && (
          <div className="relative hidden sm:block w-48 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8880]" />
            <input
              type="text"
              placeholder="Search leads"
              value={searchQuery || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-[#E7E3DB] bg-white text-sm text-[#1A1A17] placeholder:text-[#8A8880] focus:outline-none focus:ring-1 focus:ring-[#0E7C66] focus:border-[#0E7C66] transition-colors"
            />
          </div>
        )}

        <Button
          onClick={onAddLeadClick}
          className="bg-[#0E7C66] hover:bg-[#0B6654] text-white flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>Add lead</span>
        </Button>
      </div>
    </header>
  )
}
