import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import { Search, ChevronDown, ArrowDown, ArrowUp, Pencil, Trash2, Mail } from "lucide-react"
import { toast } from "sonner"
import { Lead, LeadStatus, LeadSource, SortOrder } from "../types/lead"
import { StatusBadge } from "../components/StatusBadge"
import { LeadDrawer } from "../components/LeadDrawer"
import { DeleteLeadDialog } from "../components/DeleteLeadDialog"
import {
  EmptyState,
  NoResultsState,
  ErrorState,
  TableLoadingSkeleton,
} from "../components/LeadTableStates"
import { leadSources } from "../lib/validation"
import { formatRelativeDate } from "../lib/dateUtils"
import { cn } from "../lib/utils"
import {
  fetchLeads,
  createLeadApi,
  updateLeadApi,
  deleteLeadApi,
} from "../lib/api"

export function LeadsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialStatus = searchParams.get("status") || "All"

  const [leads, setLeads] = useState<Lead[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({
    All: 0,
    New: 0,
    Contacted: 0,
    Qualified: 0,
    Lost: 0,
  })

  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatus)
  const [selectedSource, setSelectedSource] = useState<string>("All")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [currentPage, setCurrentPage] = useState<number>(1)

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Drawer & Dialog state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [deletingLead, setDeletingLead] = useState<Lead | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Load leads from API
  const loadLeads = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchLeads({
        search: searchQuery,
        status: selectedStatus,
        source: selectedSource,
        page: currentPage,
        sort: sortOrder,
      })
      setLeads(data.leads || [])
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 1)
      if (data.statusCounts) {
        setStatusCounts(data.statusCounts)
      }
    } catch (err: any) {
      setError(err?.error || "Failed to load leads from the server.")
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery, selectedStatus, selectedSource, currentPage, sortOrder])

  useEffect(() => {
    loadLeads()
  }, [loadLeads])

  // Sync status or action if URL searchParam changes
  useEffect(() => {
    const paramStatus = searchParams.get("status")
    if (paramStatus && paramStatus !== selectedStatus) {
      setSelectedStatus(paramStatus)
      setCurrentPage(1)
    }

    if (searchParams.get("action") === "add") {
      setEditingLead(null)
      setIsDrawerOpen(true)
      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete("action")
      setSearchParams(nextParams, { replace: true })
    }
  }, [searchParams, selectedStatus, setSearchParams])

  const handleStatusTabChange = (status: string) => {
    setSelectedStatus(status)
    setCurrentPage(1)
    if (status === "All") {
      searchParams.delete("status")
      setSearchParams(searchParams)
    } else {
      setSearchParams({ status })
    }
  }

  const handleSourceChange = (source: string) => {
    setSelectedSource(source)
    setCurrentPage(1)
  }

  const handleSearchChange = (val: string) => {
    setSearchQuery(val)
    setCurrentPage(1)
  }

  const handleResetFilters = () => {
    setSelectedStatus("All")
    setSelectedSource("All")
    setSearchQuery("")
    setCurrentPage(1)
    searchParams.delete("status")
    setSearchParams(searchParams)
  }

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))
  }

  // Lead CRUD handlers
  const handleSaveLead = async (formData: {
    name: string
    email: string
    phone: string
    company?: string | null
    source: LeadSource
    status: LeadStatus
  }) => {
    try {
      if (editingLead) {
        await updateLeadApi(editingLead.id, formData)
        toast.success("Lead updated successfully")
      } else {
        await createLeadApi(formData)
        toast.success("Lead created successfully")
      }
      setIsDrawerOpen(false)
      setEditingLead(null)
      loadLeads()
    } catch (err: any) {
      if (err.fields) {
        throw err
      }
      toast.error(err.error || "Failed to save lead")
      throw err
    }
  }

  const handleInlineStatusChange = async (id: string, newStatus: LeadStatus) => {
    try {
      await updateLeadApi(id, { status: newStatus })
      toast.success(`Status updated to ${newStatus}`)
      loadLeads()
    } catch {
      toast.error("Failed to update status")
    }
  }

  const handleConfirmDelete = async (lead: Lead) => {
    try {
      await deleteLeadApi(lead.id)
      toast.success(`Deleted lead "${lead.name}"`)
      setIsDeleteDialogOpen(false)
      setDeletingLead(null)
      loadLeads()
    } catch {
      toast.error("Failed to delete lead")
    }
  }

  const tabs = [
    { key: "All", label: `All ${statusCounts.All}` },
    { key: "New", label: `New ${statusCounts.New}` },
    { key: "Contacted", label: `Contacted ${statusCounts.Contacted}` },
    { key: "Qualified", label: `Qualified ${statusCounts.Qualified}` },
    { key: "Lost", label: `Lost ${statusCounts.Lost}` },
  ]

  const startIndex = (currentPage - 1) * 10

  return (
    <div className="space-y-6">
      {/* Title & Count */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-heading text-[#1A1A17] tracking-tight">
          Leads
        </h1>
        <p className="mt-1 text-sm text-[#5C5A54]">
          {statusCounts.All} leads in your pipeline
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
                onClick={() => handleStatusTabChange(tab.key)}
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

          <div className="relative">
            <select
              value={selectedSource}
              onChange={(e) => handleSourceChange(e.target.value)}
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
        {error ? (
          <ErrorState message={error} onRetry={loadLeads} />
        ) : isLoading ? (
          <TableLoadingSkeleton rows={6} />
        ) : statusCounts.All === 0 ? (
          <EmptyState
            onAddLead={() => {
              setEditingLead(null)
              setIsDrawerOpen(true)
            }}
          />
        ) : leads.length === 0 ? (
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
                  {leads.map((lead) => (
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
                            handleInlineStatusChange(lead.id, newStatus)
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
                            onClick={() => {
                              setEditingLead(lead)
                              setIsDrawerOpen(true)
                            }}
                            className="p-1.5 rounded-md text-[#5C5A54] hover:text-[#1A1A17] hover:bg-stone-100 transition-colors"
                            title="Edit lead"
                            aria-label={`Edit ${lead.name}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDeletingLead(lead)
                              setIsDeleteDialogOpen(true)
                            }}
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
              {leads.map((lead) => (
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
                        handleInlineStatusChange(lead.id, newStatus)
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
                      onClick={() => {
                        setEditingLead(lead)
                        setIsDrawerOpen(true)
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded border border-[#E7E3DB] text-[#1A1A17] hover:bg-stone-50"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeletingLead(lead)
                        setIsDeleteDialogOpen(true)
                      }}
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
            {total > 0 && (
              <div className="px-6 py-4 border-t border-[#E7E3DB] flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#FAF9F6]/50">
                <div className="text-xs sm:text-sm text-[#5C5A54]">
                  Showing {startIndex + 1}-{Math.min(startIndex + 10, total)} of {total} leads
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium text-[#1A1A17] hover:bg-stone-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    const isActive = page === currentPage
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
                    disabled={currentPage === totalPages}
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

      {/* Shared Lead Drawer (Add / Edit) */}
      <LeadDrawer
        open={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false)
          setEditingLead(null)
        }}
        onSubmit={handleSaveLead}
        leadToEdit={editingLead}
      />

      {/* Delete Confirmation Modal */}
      <DeleteLeadDialog
        open={isDeleteDialogOpen}
        lead={deletingLead}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setDeletingLead(null)
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
