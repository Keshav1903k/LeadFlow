import { useState } from "react"
import { Outlet, useLocation } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { TopBar } from "./TopBar"

interface LayoutProps {
  onAddLeadClick?: () => void
  globalSearch?: string
  onGlobalSearchChange?: (val: string) => void
}

export function Layout({
  onAddLeadClick,
  globalSearch,
  onGlobalSearchChange,
}: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  const pageTitle = location.pathname.includes("overview")
    ? "Overview"
    : "Leads"

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#1A1A17] flex">
      <Sidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 md:pl-60 flex flex-col min-h-screen">
        <TopBar
          title={pageTitle}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onAddLeadClick={onAddLeadClick}
          searchQuery={globalSearch}
          onSearchChange={onGlobalSearchChange}
        />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
