import { useState } from "react"
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom"
import { Toaster, toast } from "sonner"
import { AuthProvider, useAuth } from "./context/AuthContext"
import { Layout } from "./components/Layout"
import { LeadsPage } from "./pages/LeadsPage"
import { OverviewPage } from "./pages/OverviewPage"
import { LoginPage } from "./pages/LoginPage"
import { SignupPage } from "./pages/SignupPage"
import { LeadDrawer } from "./components/LeadDrawer"
import { DeleteLeadDialog } from "./components/DeleteLeadDialog"
import { INITIAL_LEADS } from "./lib/mockData"
import { Lead, LeadStatus, LeadSource } from "./types/lead"

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { token } = useAuth()
  const location = useLocation()

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

function PublicOnly({ children }: { children: React.ReactNode }) {
  const { token } = useAuth()
  if (token) {
    return <Navigate to="/leads" replace />
  }
  return <>{children}</>
}

function AppContent() {
  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem("leadflow_leads")
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        // Fall back to INITIAL_LEADS
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

  const handleOpenAdd = () => {
    setEditingLead(null)
    setIsDrawerOpen(true)
  }

  const handleOpenEdit = (lead: Lead) => {
    setEditingLead(lead)
    setIsDrawerOpen(true)
  }

  const handleOpenDelete = (lead: Lead) => {
    setDeletingLead(lead)
    setIsDeleteDialogOpen(true)
  }

  const handleSaveLead = async (formData: {
    name: string
    email: string
    phone: string
    company?: string | null
    source: LeadSource
    status: LeadStatus
  }) => {
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
      const newLead: Lead = {
        id: `lead-${Date.now()}`,
        ...formData,
        createdAt: new Date().toISOString(),
      }
      updateLeads([newLead, ...leads])
      toast.success("Lead created successfully")
    }
  }

  const handleConfirmDelete = (lead: Lead) => {
    const updated = leads.filter((l) => l.id !== lead.id)
    updateLeads(updated)
    toast.success(`Deleted lead "${lead.name}"`)
  }

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
    <>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicOnly>
              <LoginPage />
            </PublicOnly>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicOnly>
              <SignupPage />
            </PublicOnly>
          }
        />

        <Route
          element={
            <RequireAuth>
              <Layout onAddLeadClick={handleOpenAdd} />
            </RequireAuth>
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
        </Route>

        <Route path="*" element={<Navigate to="/leads" replace />} />
      </Routes>

      <LeadDrawer
        open={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false)
          setEditingLead(null)
        }}
        onSubmit={handleSaveLead}
        leadToEdit={editingLead}
      />

      <DeleteLeadDialog
        open={isDeleteDialogOpen}
        lead={deletingLead}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setDeletingLead(null)
        }}
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" richColors />
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  )
}
