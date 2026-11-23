import { NavLink } from "react-router-dom"
import {
  TrendingUp,
  LayoutDashboard,
  Users,
  LogOut,
  X,
} from "lucide-react"
import { cn } from "../lib/utils"
import { useAuth } from "../context/AuthContext"

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const { user, logout } = useAuth()

  const navItems = [
    { label: "Overview", to: "/overview", icon: LayoutDashboard },
    { label: "Leads", to: "/leads", icon: Users },
  ]

  const userName = user?.name || "Keshav Sharma"
  const initials = userName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "KS"

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 w-60 bg-white border-r border-[#E7E3DB] flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Top Header */}
        <div>
          <div className="h-16 px-6 flex items-center justify-between border-b border-[#E7E3DB]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#0E7C66] flex items-center justify-center text-white shadow-sm">
                <TrendingUp className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="font-heading font-bold text-xl text-[#1A1A17] tracking-tight">
                LeadFlow
              </span>
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-md text-[#5C5A54] hover:bg-stone-100 md:hidden"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-[#0E7C66] text-white shadow-sm"
                        : "text-[#1A1A17] hover:bg-stone-100/80"
                    )
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* Bottom User Profile */}
        <div className="p-4 border-t border-[#E7E3DB]">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-9 h-9 rounded-full bg-[#EAE8E2] border border-[#E7E3DB] flex items-center justify-center text-[#1A1A17] font-semibold text-xs tracking-wider flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#1A1A17] truncate leading-tight">
                {userName}
              </p>
              <p className="text-xs text-[#5C5A54] truncate">Sales Manager</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium text-[#5C5A54] hover:text-[#1A1A17] hover:bg-stone-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Log out</span>
          </button>
        </div>
      </aside>
    </>
  )
}
