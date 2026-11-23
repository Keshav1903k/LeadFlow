import { Dialog } from "./ui/dialog"
import { Button } from "./ui/button"
import { Lead } from "../types/lead"

interface DeleteLeadDialogProps {
  open: boolean
  lead: Lead | null
  onClose: () => void
  onConfirm: (lead: Lead) => Promise<void> | void
  isLoading?: boolean
}

export function DeleteLeadDialog({
  open,
  lead,
  onClose,
  onConfirm,
  isLoading = false,
}: DeleteLeadDialogProps) {
  if (!lead) return null

  const handleConfirm = async () => {
    await onConfirm(lead)
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Delete lead"
      description={`Are you sure you want to delete "${lead.name}"? This action cannot be undone.`}
    >
      <div className="flex items-center justify-end gap-3 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="danger"
          onClick={handleConfirm}
          disabled={isLoading}
        >
          {isLoading ? "Deleting..." : "Delete"}
        </Button>
      </div>
    </Dialog>
  )
}
