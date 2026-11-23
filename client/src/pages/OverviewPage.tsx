import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowRight, RefreshCw, AlertCircle } from "lucide-react"
import { Lead } from "../types/lead"
import { StatusBadge } from "../components/StatusBadge"
import { fetchLeadStats, updateLeadApi } from "../lib/api"
import { formatRelativeDate } from "../lib/dateUtils"
import { useAuth } from "../context/AuthContext"
import { Button } from "../components/ui/button"
import { toast } from "sonner"

interface StatsData {
  total: number
  counts: Record<string, number>
  conversionRate: string
  addedThisWeek: number
  recentLeads: Lead[]
}

export function OverviewPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [stats, setStats] = useState<StatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadStats = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchLeadStats()
      setStats(data)
    } catch (err: any) {
      setError(err?.error || "Failed to load pipeline stats.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  const handleStageClick = (status: string) => {
    navigate(`/leads?status=${status}`)
  }

  const handleInlineStatusChange = async (id: string, newStatus: any) => {
    try {
      await updateLeadApi(id, { status: newStatus })
      toast.success(`Status updated to ${newStatus}`)
      loadStats()
    } catch {
      toast.error("Failed to update status")
    }
  }

  if (error) {
    return (
      <div className="py-16 text-center">
        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3 text-red-600">
          <AlertCircle className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-semibold text-[#1A1A17]">Connection error</h3>
        <p className="text-xs text-[#5C5A54] mt-1 max-w-sm mx-auto">{error}</p>
        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={loadStats}
            className="inline-flex items-center gap-1.5 text-xs text-[#1A1A17]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading || !stats) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="space-y-2">
          <div className="h-8 bg-stone-200 rounded w-48" />
          <div className="h-4 bg-stone-100 rounded w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="h-32 bg-stone-200/60 rounded-xl" />
          <div className="h-32 bg-stone-200/60 rounded-xl" />
          <div className="h-32 bg-stone-200/60 rounded-xl" />
        </div>
        <div className="h-28 bg-stone-200/60 rounded-xl" />
        <div className="h-64 bg-stone-200/60 rounded-xl" />
      </div>
    )
  }

  const total = stats.total
  const qualifiedCount = stats.counts.Qualified || 0
  const newCount = stats.counts.New || 0
  const contactedCount = stats.counts.Contacted || 0
  const lostCount = stats.counts.Lost || 0

  const firstName = user?.name ? user.name.split(" ")[0] : "there"

  return (
    <div className="space-y-8">
      {/* Greeting Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-heading text-[#1A1A17] tracking-tight">
          {getGreeting()}, {firstName}
        </h1>
        <p className="mt-1 text-sm text-[#5C5A54]">
          {qualifiedCount} leads are qualified and ready for a proposal. {newCount} new leads haven't been contacted yet.
        </p>
      </div>

      {/* 3 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-xl border border-[#E7E3DB] shadow-sm">
          <p className="text-xs font-medium text-[#5C5A54] uppercase tracking-wider">
            Total leads
          </p>
          <p className="text-3xl font-bold font-heading text-[#1A1A17] mt-3">
            {total}
          </p>
          <p className="text-xs text-[#5C5A54] mt-1">Across your pipeline</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#E7E3DB] shadow-sm">
          <p className="text-xs font-medium text-[#5C5A54] uppercase tracking-wider">
            Conversion rate
          </p>
          <p className="text-3xl font-bold font-heading text-[#1A1A17] mt-3">
            {stats.conversionRate}
          </p>
          <p className="text-xs text-[#5C5A54] mt-1">
            {qualifiedCount} of {total} qualified
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#E7E3DB] shadow-sm">
          <p className="text-xs font-medium text-[#5C5A54] uppercase tracking-wider">
            Added this week
          </p>
          <p className="text-3xl font-bold font-heading text-[#1A1A17] mt-3">
            {stats.addedThisWeek}
          </p>
          <p className="text-xs text-[#5C5A54] mt-1">Added in the last 7 days</p>
        </div>
      </div>

      {/* Pipeline at a glance */}
      <div className="bg-white p-6 rounded-xl border border-[#E7E3DB] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold font-heading text-[#1A1A17]">
            Pipeline at a glance
          </h2>
          <span className="text-xs text-[#5C5A54]">
            Select a stage to see its leads
          </span>
        </div>

        {/* Multi-segment bar */}
        <div className="h-4 w-full bg-stone-100 rounded-full overflow-hidden flex">
          {total > 0 ? (
            <>
              <div
                style={{ width: `${(newCount / total) * 100}%` }}
                className="bg-[#64748B] h-full transition-all hover:opacity-90 cursor-pointer"
                title={`New: ${newCount}`}
                onClick={() => handleStageClick("New")}
              />
              <div
                style={{ width: `${(contactedCount / total) * 100}%` }}
                className="bg-[#D97706] h-full transition-all hover:opacity-90 cursor-pointer"
                title={`Contacted: ${contactedCount}`}
                onClick={() => handleStageClick("Contacted")}
              />
              <div
                style={{ width: `${(qualifiedCount / total) * 100}%` }}
                className="bg-[#0E7C66] h-full transition-all hover:opacity-90 cursor-pointer"
                title={`Qualified: ${qualifiedCount}`}
                onClick={() => handleStageClick("Qualified")}
              />
              <div
                style={{ width: `${(lostCount / total) * 100}%` }}
                className="bg-[#B91C1C] h-full transition-all hover:opacity-90 cursor-pointer"
                title={`Lost: ${lostCount}`}
                onClick={() => handleStageClick("Lost")}
              />
            </>
          ) : (
            <div className="w-full bg-stone-200 h-full" />
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-[#1A1A17] font-medium">
          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-80"
            onClick={() => handleStageClick("New")}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#64748B]" />
            <span>New <span className="font-bold">{newCount}</span></span>
          </div>
          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-80"
            onClick={() => handleStageClick("Contacted")}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
            <span>Contacted <span className="font-bold">{contactedCount}</span></span>
          </div>
          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-80"
            onClick={() => handleStageClick("Qualified")}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#0E7C66]" />
            <span>Qualified <span className="font-bold">{qualifiedCount}</span></span>
          </div>
          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-80"
            onClick={() => handleStageClick("Lost")}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#B91C1C]" />
            <span>Lost <span className="font-bold">{lostCount}</span></span>
          </div>
        </div>
      </div>

      {/* Recent Leads Table Card */}
      <div className="bg-white rounded-xl border border-[#E7E3DB] shadow-sm overflow-hidden">
        <div className="p-6 pb-4 flex items-center justify-between border-b border-[#E7E3DB]">
          <h2 className="text-base font-bold font-heading text-[#1A1A17]">
            Recent leads
          </h2>
          <button
            type="button"
            onClick={() => navigate("/leads")}
            className="text-xs font-semibold text-[#0E7C66] hover:underline flex items-center gap-1"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF9F6] border-b border-[#E7E3DB] text-xs font-semibold text-[#5C5A54] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-6">NAME</th>
                <th className="py-3 px-6">EMAIL</th>
                <th className="py-3 px-6">PHONE</th>
                <th className="py-3 px-6">SOURCE</th>
                <th className="py-3 px-6">STATUS</th>
                <th className="py-3 px-6">CREATED</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E3DB]">
              {stats.recentLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#5C5A54] text-xs">
                    No leads added yet.
                  </td>
                </tr>
              ) : (
                stats.recentLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3 px-6">
                      <div className="font-medium text-[#1A1A17] text-sm">
                        {lead.name}
                      </div>
                      <div className="text-xs text-[#5C5A54]">
                        {lead.company || "-"}
                      </div>
                    </td>
                    <td className="py-3 px-6">
                      <a
                        href={`mailto:${lead.email}`}
                        className="text-[#0E7C66] hover:underline text-sm font-medium"
                      >
                        {lead.email}
                      </a>
                    </td>
                    <td className="py-3 px-6 text-sm text-[#1A1A17]">
                      {lead.phone}
                    </td>
                    <td className="py-3 px-6 text-sm text-[#5C5A54]">
                      {lead.source}
                    </td>
                    <td className="py-3 px-6">
                      <StatusBadge
                        status={lead.status}
                        onStatusChange={(newStatus) =>
                          handleInlineStatusChange(lead.id, newStatus)
                        }
                      />
                    </td>
                    <td className="py-3 px-6 text-sm text-[#5C5A54]">
                      {formatRelativeDate(lead.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
