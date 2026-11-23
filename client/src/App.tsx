import { useState } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Toaster, toast } from "sonner"
import { Layout } from "./components/Layout"
import { LeadsPage } from "./pages/LeadsPage"
import { OverviewPage } from "./pages/OverviewPage"
import { LeadDrawer } from "./components/LeadDrawer"
import { DeleteLeadDialog } from "./components/DeleteLeadDialog"
import { INITIAL_LEADS } from "./lib/mockData"
import { Lead, LeadStatus, LeadSource } from "./types/lead"

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

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)

  // Delete dialog state
  const [deletingLead, setDeletingLead] = useState<Lead | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Synchronize leads to local storage
  const updateLeads = (newLeads: Lead[]) => {
    setLeads(newLeads)
    localStorage.setItem("leadflow_leads", JSON.stringify(newLeads))
  }

  // Handle open Add lead
  const handleOpenAdd = () => {
    setEditingLead(null)
    setIsDrawerOpen(true)
  }

  // Handle open Edit lead
  const handleOpenEdit = (lead: Lead) => {
    setEditingLead(lead)
    setIsDrawerOpen(true)
  }

  // Handle open Delete dialog
  const handleOpenDelete = (lead: Lead) => {
    setDeletingLead(lead)
    setIsDeleteDialogOpen(true)
  }

  // Save lead (Add or Edit)
  const handleSaveLead = async (formData: {
    name: string
    email: string
    phone: string
    company?: string | null
    source: LeadSource
    status: LeadStatus
  }) => {
    // Check for duplicate email (unique constraint check)
    const existing = leads.find(
      (l) =>
        l.email.toLowerCase() === formData.email.toLowerCase() &&
        (!editingLead || l.id !== editingLead.id)
    )

    if (existing) {
      toast.error("A lead with this email already exists")
      throw {
        fields: {
          email: "A lead with this email address already exists",
        },
      }
    }

    if (editingLead) {
      // Edit existing
      const updated = leads.map((l) =>
        l.id === editingLead.id
          ? {
              ...l,
              ...formData,
              updatedAt: new Date().toISOString(),
            }
          : l
      )
      updateLeads(updated)
      toast.success("Lead updated successfully")
    } else {
      // Create new lead
      const newLead: Lead = {
        id: `lead-${Date.now()}`,
        ...formData,
        createdAt: new Date().toISOString(),
      }
      updateLeads([newLead, ...leads])
      toast.success("Lead created successfully")
    }
  }

  // Confirm delete
  const handleConfirmDelete = (lead: Lead) => {
    const updated = leads.filter((l) => l.id !== lead.id)
    updateLeads(updated)
    toast.success(`Deleted lead "${lead.name}"`)
  }

  // Inline status change
  const handleStatusChange = (id: string, newStatus: LeadStatus) => {
    const lead = leads.find((l) => l.id === id)
    const updated = leads.map((l) =>
      l.id === id ? { ...l, status: newStatus } : l
    )
    updateLeads(updated)
    if (lead) {
      toast.success(`Updated ${lead.name} to ${newStatus}`)
    }
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />

      <Routes>
        <Route
          element={
            <Layout
              onAddLeadClick={handleOpenAdd}
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
                onAddLeadClick={handleOpenAdd}
                onEditLead={handleOpenEdit}
                onDeleteLead={handleOpenDelete}
                onStatusChange={handleStatusChange}
              />
            }
          />
          <Route path="*" element={<Navigate to="/leads" replace />} />
        </Route>
      </Routes>

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
    </BrowserRouter>
  )
}
