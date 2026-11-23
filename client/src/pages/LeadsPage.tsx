import { useState, useMemo, useEffect } from "react"
import { Search, ChevronDown, ArrowDown, ArrowUp, Pencil, Trash2, Mail } from "lucide-react"
import { Lead, LeadStatus, SortOrder } from "../types/lead"
import { INITIAL_LEADS, formatRelativeDate } from "../lib/mockData"
import { StatusBadge } from "../components/StatusBadge"
import { leadSources } from "../lib/validation"
import { cn } from "../lib/utils"
import {
  EmptyState,
  NoResultsState,
  ErrorState,
  TableLoadingSkeleton,
} from "../components/LeadTableStates"

const ITEMS_PER_PAGE = 10

interface LeadsPageProps {
  leadsData?: Lead[]
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
  onAddLeadClick?: () => void
  onEditLead?: (lead: Lead) => void
  onDeleteLead?: (lead: Lead) => void
  onStatusChange?: (id: string, newStatus: LeadStatus) => void
}

export function LeadsPage({
  leadsData,
  isLoading = false,
  error = null,
  onRetry,
  onAddLeadClick,
  onEditLead,
  onDeleteLead,
  onStatusChange,
}: LeadsPageProps) {
  const [leads, setLeads] = useState<Lead[]>(leadsData || INITIAL_LEADS)
  const [selectedStatus, setSelectedStatus] = useState<string>("All")
  const [selectedSource, setSelectedSource] = useState<string>("All")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [currentPage, setCurrentPage] = useState<number>(1)

  useEffect(() => {
    if (leadsData) {
      setLeads(leadsData)
    }
  }, [leadsData])

  // Compute status counts across all leads
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      All: leads.length,
      New: 0,
      Contacted: 0,
      Qualified: 0,
      Lost: 0,
    }
    leads.forEach((l) => {
      if (counts[l.status] !== undefined) {
        counts[l.status] += 1
      }
    })
    return counts
  }, [leads])

  // Filter leads by search query, status tab, and source dropdown
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (selectedStatus !== "All" && lead.status !== selectedStatus) {
        return false
      }
      if (selectedSource !== "All" && lead.source !== selectedSource) {
        return false
      }
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase().trim()
        const matchesName = lead.name.toLowerCase().includes(query)
        const matchesCompany = lead.company?.toLowerCase().includes(query)
        if (!matchesName && !matchesCompany) {
          return false
        }
      }
      return true
    })
  }, [leads, selectedStatus, selectedSource, searchQuery])

  // Sort filtered leads by createdAt
  const sortedLeads = useMemo(() => {
    return [...filteredLeads].sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime()
      const timeB = new Date(b.createdAt).getTime()
      return sortOrder === "desc" ? timeB - timeA : timeA - timeB
    })
  }, [filteredLeads, sortOrder])

  // Pagination calculation
  const totalLeads = sortedLeads.length
  const totalPages = Math.max(1, Math.ceil(totalLeads / ITEMS_PER_PAGE))
  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE
  const paginatedLeads = sortedLeads.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const handleStatusFilterChange = (status: string) => {
    setSelectedStatus(status)
    setCurrentPage(1)
  }

  const handleSourceFilterChange = (source: string) => {
    setSelectedSource(source)
    setCurrentPage(1)
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handleResetFilters = () => {
    setSelectedStatus("All")
    setSelectedSource("All")
    setSearchQuery("")
    setCurrentPage(1)
  }

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))
  }

  const tabs = [
    { key: "All", label: `All ${statusCounts.All}` },
    { key: "New", label: `New ${statusCounts.New}` },
    { key: "Contacted", label: `Contacted ${statusCounts.Contacted}` },
    { key: "Qualified", label: `Qualified ${statusCounts.Qualified}` },
    { key: "Lost", label: `Lost ${statusCounts.Lost}` },
  ]

  return (
    <div className="space-y-6">
      {/* Page Title & Subtitle */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-heading text-[#1A1A17] tracking-tight">
          Leads
        </h1>
        <p className="mt-1 text-sm text-[#5C5A54]">
          {leads.length} leads in your pipeline
        </p>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E7E3DB] pb-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = selectedStatus === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleStatusFilterChange(tab.key)}
                className={cn(
                  "relative pb-2 text-sm whitespace-nowrap transition-colors",
                  isActive
                    ? "font-semibold text-[#0E7C66]"
                    : "text-[#5C5A54] hover:text-[#1A1A17] font-medium"
                )}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-[-13px] left-0 right-0 h-0.5 bg-[#0E7C66] rounded-full" />
                )}
              </button>
            )
          })}
        </div>

        {/* Search & Source Filter Controls */}
        <div className="flex items-center gap-3">
          {/* Search by name or company */}
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8880]" />
            <input
              type="text"
              placeholder="Search by name or company"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-[#E7E3DB] bg-white text-sm text-[#1A1A17] placeholder:text-[#8A8880] focus:outline-none focus:ring-1 focus:ring-[#0E7C66] focus:border-[#0E7C66] transition-colors"
            />
          </div>

          {/* Source Dropdown Filter */}
          <div className="relative">
            <select
              value={selectedSource}
              onChange={(e) => handleSourceFilterChange(e.target.value)}
              className="h-9 pl-3 pr-8 rounded-lg border border-[#E7E3DB] bg-white text-sm text-[#1A1A17] appearance-none focus:outline-none focus:ring-1 focus:ring-[#0E7C66] focus:border-[#0E7C66] cursor-pointer transition-colors"
            >
              <option value="All">All sources</option>
              {leadSources.map((src) => (
                <option key={src} value={src}>
                  {src}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#5C5A54] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-[#E7E3DB] shadow-sm overflow-hidden">
        {/* Error State */}
        {error ? (
          <ErrorState message={error} onRetry={onRetry || (() => {})} />
        ) : isLoading ? (
          /* Loading Skeleton */
          <TableLoadingSkeleton rows={6} />
        ) : leads.length === 0 ? (
          /* Empty State (0 leads overall) */
          <EmptyState onAddLead={onAddLeadClick || (() => {})} />
        ) : filteredLeads.length === 0 ? (
          /* No Results State (filters matched nothing) */
          <NoResultsState onResetFilters={handleResetFilters} />
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#FAF9F6] border-b border-[#E7E3DB] text-xs font-semibold text-[#5C5A54] uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-6">NAME</th>
                    <th className="py-3.5 px-6">EMAIL</th>
                    <th className="py-3.5 px-6">PHONE</th>
                    <th className="py-3.5 px-6">SOURCE</th>
                    <th className="py-3.5 px-6">STATUS</th>
                    <th className="py-3.5 px-6">
                      <button
                        type="button"
                        onClick={toggleSortOrder}
                        className="inline-flex items-center gap-1.5 font-semibold text-[#5C5A54] hover:text-[#1A1A17] transition-colors"
                        title={`Sort by date: currently ${sortOrder === "desc" ? "newest first" : "oldest first"}`}
                      >
                        <span>CREATED</span>
                        {sortOrder === "desc" ? (
                          <ArrowDown className="w-3.5 h-3.5 text-[#1A1A17]" />
                        ) : (
                          <ArrowUp className="w-3.5 h-3.5 text-[#1A1A17]" />
                        )}
                      </button>
                    </th>
                    <th className="py-3.5 px-6 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E3DB]">
                  {paginatedLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="hover:bg-stone-50/70 transition-colors"
                    >
                      <td className="py-3.5 px-6">
                        <div className="font-medium text-[#1A1A17] text-sm leading-tight">
                          {lead.name}
                        </div>
                        <div className="text-xs text-[#5C5A54] mt-0.5">
                          {lead.company || "-"}
                        </div>
                      </td>

                      <td className="py-3.5 px-6">
                        <a
                          href={`mailto:${lead.email}`}
                          className="text-[#0E7C66] hover:underline text-sm font-medium"
                        >
                          {lead.email}
                        </a>
                      </td>

                      <td className="py-3.5 px-6 text-[#1A1A17] text-sm">
                        {lead.phone}
                      </td>

                      <td className="py-3.5 px-6 text-[#5C5A54] text-sm">
                        {lead.source}
                      </td>

                      <td className="py-3.5 px-6">
                        <StatusBadge
                          status={lead.status}
                          onStatusChange={(newStatus) =>
                            onStatusChange?.(lead.id, newStatus)
                          }
                        />
                      </td>

                      <td className="py-3.5 px-6 text-[#5C5A54] text-sm">
                        {formatRelativeDate(lead.createdAt)}
                      </td>

                      <td className="py-3.5 px-6 text-right">
                        <div className="inline-flex items-center gap-1 justify-end">
                          <button
                            type="button"
                            onClick={() => onEditLead?.(lead)}
                            className="p-1.5 rounded-md text-[#5C5A54] hover:text-[#1A1A17] hover:bg-stone-100 transition-colors"
                            title="Edit lead"
                            aria-label={`Edit ${lead.name}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteLead?.(lead)}
                            className="p-1.5 rounded-md text-[#5C5A54] hover:text-[#B91C1C] hover:bg-red-50 transition-colors"
                            title="Delete lead"
                            aria-label={`Delete ${lead.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Cards View */}
            <div className="block md:hidden divide-y divide-[#E7E3DB]">
              {paginatedLeads.map((lead) => (
                <div key={lead.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-semibold text-[#1A1A17]">
                        {lead.name}
                      </h3>
                      <p className="text-xs text-[#5C5A54]">{lead.company || "-"}</p>
                    </div>
                    <StatusBadge
                      status={lead.status}
                      onStatusChange={(newStatus) =>
                        onStatusChange?.(lead.id, newStatus)
                      }
                    />
                  </div>

                  <div className="space-y-1 text-xs text-[#5C5A54]">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#0E7C66]" />
                      <a
                        href={`mailto:${lead.email}`}
                        className="text-[#0E7C66] hover:underline"
                      >
                        {lead.email}
                      </a>
                    </div>
                    <div>Phone: {lead.phone}</div>
                    <div className="flex items-center justify-between pt-1">
                      <span>Source: {lead.source}</span>
                      <span>Created: {formatRelativeDate(lead.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E7E3DB]/50">
                    <button
                      type="button"
                      onClick={() => onEditLead?.(lead)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded border border-[#E7E3DB] text-[#1A1A17] hover:bg-stone-50"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteLead?.(lead)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded border border-[#E7E3DB] text-[#B91C1C] hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Footer */}
            {totalLeads > 0 && (
              <div className="px-6 py-4 border-t border-[#E7E3DB] flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#FAF9F6]/50">
                <div className="text-xs sm:text-sm text-[#5C5A54]">
                  Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, totalLeads)} of {totalLeads} leads
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={safePage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium text-[#1A1A17] hover:bg-stone-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    const isActive = page === safePage
                    return (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={cn(
                          "w-8 h-8 rounded-lg text-sm font-medium transition-colors flex items-center justify-center",
                          isActive
                            ? "bg-[#0E7C66] text-white shadow-sm"
                            : "text-[#1A1A17] hover:bg-stone-100"
                        )}
                      >
                        {page}
                      </button>
                    )
                  })}

                  <button
                    type="button"
                    disabled={safePage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium text-[#1A1A17] hover:bg-stone-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
