import { useState } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { TopBar } from "./TopBar"

interface LayoutProps {
  onAddLeadClick?: () => void
}

export function Layout({ onAddLeadClick }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const pageTitle = location.pathname.includes("overview")
    ? "Overview"
    : "Leads"

  const handleAddClick = onAddLeadClick || (() => navigate("/leads?action=add"))

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
          onAddLeadClick={handleAddClick}
        />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
