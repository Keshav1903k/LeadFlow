import { useState } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Layout } from "./components/Layout"
import { LeadsPage } from "./pages/LeadsPage"
import { OverviewPage } from "./pages/OverviewPage"
import { INITIAL_LEADS } from "./lib/mockData"
import { Lead, LeadStatus } from "./types/lead"

export default function App() {
  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem("leadflow_leads")
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        // Fall back to INITIAL_LEADS on parse error
      }
    }
    return INITIAL_LEADS
  })

  // Synchronize leads to local storage
  const updateLeads = (newLeads: Lead[]) => {
    setLeads(newLeads)
    localStorage.setItem("leadflow_leads", JSON.stringify(newLeads))
  }

  // Handle inline status change
  const handleStatusChange = (id: string, newStatus: LeadStatus) => {
    const updated = leads.map((lead) =>
      lead.id === id ? { ...lead, status: newStatus } : lead
    )
    updateLeads(updated)
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          element={
            <Layout
              onAddLeadClick={() => {
                alert("Add Lead drawer is part of Phase 3.")
              }}
            />
          }
        >
          <Route path="/" element={<Navigate to="/leads" replace />} />
          <Route
            path="/overview"
            element={<OverviewPage leadsData={leads} />}
          />
          <Route
            path="/leads"
            element={
              <LeadsPage
                leadsData={leads}
                onStatusChange={handleStatusChange}
                onEditLead={(lead) => {
                  alert(`Edit lead ${lead.name} (Phase 3 drawer)`)
                }}
                onDeleteLead={(lead) => {
                  alert(`Delete confirmation for ${lead.name} (Phase 3 dialog)`)
                }}
              />
            }
          />
          <Route path="*" element={<Navigate to="/leads" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
