import { useNavigate } from "react-router-dom"
import { ArrowRight, Pencil, Trash2 } from "lucide-react"
import { Lead } from "../types/lead"
import { INITIAL_LEADS, formatRelativeDate } from "../lib/mockData"
import { StatusBadge } from "../components/StatusBadge"

interface OverviewPageProps {
  leadsData?: Lead[]
  onStatusFilterSelect?: (status: string) => void
}

export function OverviewPage({ leadsData }: OverviewPageProps) {
  const navigate = useNavigate()
  const leads = leadsData || INITIAL_LEADS

  // Greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  // Calculate statistics
  const totalLeads = leads.length
  const qualifiedCount = leads.filter((l) => l.status === "Qualified").length
  const newCount = leads.filter((l) => l.status === "New").length
  const contactedCount = leads.filter((l) => l.status === "Contacted").length
  const lostCount = leads.filter((l) => l.status === "Lost").length

  const conversionRate =
    totalLeads > 0 ? ((qualifiedCount / totalLeads) * 100).toFixed(1) : "0"

  // Added in last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).getTime()
  const addedThisWeek = leads.filter(
    (l) => new Date(l.createdAt).getTime() >= sevenDaysAgo
  ).length

  // Top 5 most recent leads
  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const handleStageClick = () => {
    navigate("/leads")
  }

  return (
    <div className="space-y-8">
      {/* Greeting Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-heading text-[#1A1A17] tracking-tight">
          {getGreeting()}, Keshav
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
            {totalLeads}
          </p>
          <p className="text-xs text-[#5C5A54] mt-1">Across your pipeline</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#E7E3DB] shadow-sm">
          <p className="text-xs font-medium text-[#5C5A54] uppercase tracking-wider">
            Conversion rate
          </p>
          <p className="text-3xl font-bold font-heading text-[#1A1A17] mt-3">
            {conversionRate}%
          </p>
          <p className="text-xs text-[#5C5A54] mt-1">
            {qualifiedCount} of {totalLeads} qualified
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#E7E3DB] shadow-sm">
          <p className="text-xs font-medium text-[#5C5A54] uppercase tracking-wider">
            Added this week
          </p>
          <p className="text-3xl font-bold font-heading text-[#1A1A17] mt-3">
            {addedThisWeek}
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
        <div className="h-4 w-full bg-stone-100 rounded-full overflow-hidden flex cursor-pointer" onClick={handleStageClick}>
          <div
            style={{ width: `${(newCount / totalLeads) * 100}%` }}
            className="bg-[#64748B] h-full transition-all hover:opacity-90"
            title={`New: ${newCount}`}
          />
          <div
            style={{ width: `${(contactedCount / totalLeads) * 100}%` }}
            className="bg-[#D97706] h-full transition-all hover:opacity-90"
            title={`Contacted: ${contactedCount}`}
          />
          <div
            style={{ width: `${(qualifiedCount / totalLeads) * 100}%` }}
            className="bg-[#0E7C66] h-full transition-all hover:opacity-90"
            title={`Qualified: ${qualifiedCount}`}
          />
          <div
            style={{ width: `${(lostCount / totalLeads) * 100}%` }}
            className="bg-[#B91C1C] h-full transition-all hover:opacity-90"
            title={`Lost: ${lostCount}`}
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-[#1A1A17] font-medium">
          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-80"
            onClick={handleStageClick}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#64748B]" />
            <span>New <span className="font-bold">{newCount}</span></span>
          </div>
          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-80"
            onClick={handleStageClick}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
            <span>Contacted <span className="font-bold">{contactedCount}</span></span>
          </div>
          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-80"
            onClick={handleStageClick}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#0E7C66]" />
            <span>Qualified <span className="font-bold">{qualifiedCount}</span></span>
          </div>
          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-80"
            onClick={handleStageClick}
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
                <th className="py-3 px-6 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E3DB]">
              {recentLeads.map((lead) => (
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
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="py-3 px-6 text-sm text-[#5C5A54]">
                    {formatRelativeDate(lead.createdAt)}
                  </td>
                  <td className="py-3 px-6 text-right">
                    <div className="inline-flex items-center gap-1 justify-end">
                      <button
                        type="button"
                        onClick={() => navigate("/leads")}
                        className="p-1.5 rounded-md text-[#5C5A54] hover:text-[#1A1A17] hover:bg-stone-100"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate("/leads")}
                        className="p-1.5 rounded-md text-[#5C5A54] hover:text-[#B91C1C] hover:bg-red-50"
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
      </div>
    </div>
  )
}
