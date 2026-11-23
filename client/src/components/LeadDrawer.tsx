import { useState, useEffect } from "react"
import { Sheet } from "./ui/sheet"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { ChevronDown } from "lucide-react"
import { Lead, LeadStatus, LeadSource } from "../types/lead"
import { leadSchema, leadSources, leadStatuses } from "../lib/validation"

interface LeadDrawerProps {
  open: boolean
  onClose: () => void
  onSubmit: (leadData: {
    name: string
    email: string
    phone: string
    company?: string | null
    source: LeadSource
    status: LeadStatus
  }) => Promise<void> | void
  leadToEdit?: Lead | null
  isLoading?: boolean
}

export function LeadDrawer({
  open,
  onClose,
  onSubmit,
  leadToEdit,
  isLoading = false,
}: LeadDrawerProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [company, setCompany] = useState("")
  const [source, setSource] = useState<LeadSource>("Website")
  const [status, setStatus] = useState<LeadStatus>("New")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEditing = Boolean(leadToEdit)

  useEffect(() => {
    if (open) {
      if (leadToEdit) {
        setName(leadToEdit.name)
        setEmail(leadToEdit.email)
        setPhone(leadToEdit.phone)
        setCompany(leadToEdit.company || "")
        setSource(leadToEdit.source)
        setStatus(leadToEdit.status)
      } else {
        setName("")
        setEmail("")
        setPhone("")
        setCompany("")
        setSource("Website")
        setStatus("New")
      }
      setErrors({})
    }
  }, [open, leadToEdit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const formData = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      company: company.trim() || null,
      source,
      status,
    }

    const validationResult = leadSchema.safeParse(formData)

    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {}
      validationResult.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as string
        if (fieldName && !fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message
        }
      })
      setErrors(fieldErrors)
      return
    }

    setErrors({})
    try {
      await onSubmit(validationResult.data)
      onClose()
    } catch (err: unknown) {
      if (err && typeof err === "object" && "fields" in err) {
        setErrors((err as { fields: Record<string, string> }).fields || {})
      }
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit lead" : "Add lead"}
      description={
        isEditing
          ? "Update details for this lead."
          : "Fill in the details to capture a new lead."
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-full justify-between gap-6">
        <div className="space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-xs font-semibold text-[#1A1A17] mb-1.5 uppercase tracking-wider">
              Name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="e.g. Aarav Malhotra"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (errors.name) setErrors((prev) => ({ ...prev, name: "" }))
              }}
              error={errors.name}
              disabled={isLoading}
            />
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-xs font-semibold text-[#1A1A17] mb-1.5 uppercase tracking-wider">
              Email <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              placeholder="e.g. aarav@company.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors((prev) => ({ ...prev, email: "" }))
              }}
              error={errors.email}
              disabled={isLoading}
            />
          </div>

          {/* Phone Field */}
          <div>
            <label className="block text-xs font-semibold text-[#1A1A17] mb-1.5 uppercase tracking-wider">
              Phone <span className="text-red-500">*</span>
            </label>
            <Input
              type="tel"
              placeholder="e.g. +91 98110 24763"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value)
                if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }))
              }}
              error={errors.phone}
              disabled={isLoading}
            />
          </div>

          {/* Company Field (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-[#1A1A17] mb-1.5 uppercase tracking-wider">
              Company <span className="text-xs font-normal text-[#5C5A54] normal-case">(optional)</span>
            </label>
            <Input
              type="text"
              placeholder="e.g. Malhotra Dental Clinic"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Source Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-[#1A1A17] mb-1.5 uppercase tracking-wider">
              Source <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as LeadSource)}
                disabled={isLoading}
                className="w-full h-9 pl-3 pr-8 rounded-lg border border-[#E7E3DB] bg-white text-sm text-[#1A1A17] appearance-none focus:outline-none focus:ring-1 focus:ring-[#0E7C66] focus:border-[#0E7C66] transition-colors"
              >
                {leadSources.map((src) => (
                  <option key={src} value={src}>
                    {src}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#5C5A54] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Status Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-[#1A1A17] mb-1.5 uppercase tracking-wider">
              Status <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as LeadStatus)}
                disabled={isLoading}
                className="w-full h-9 pl-3 pr-8 rounded-lg border border-[#E7E3DB] bg-white text-sm text-[#1A1A17] appearance-none focus:outline-none focus:ring-1 focus:ring-[#0E7C66] focus:border-[#0E7C66] transition-colors"
              >
                {leadStatuses.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#5C5A54] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-[#E7E3DB] flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-[#0E7C66] hover:bg-[#0B6654] text-white"
          >
            {isLoading ? "Saving..." : isEditing ? "Save changes" : "Add lead"}
          </Button>
        </div>
      </form>
    </Sheet>
  )
}
