import { Search, Plus, RefreshCw, AlertCircle, Users } from "lucide-react"
import { Button } from "./ui/button"

interface EmptyStateProps {
  onAddLead: () => void
}

export function EmptyState({ onAddLead }: EmptyStateProps) {
  return (
    <div className="py-16 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4 text-[#5C5A54]">
        <Users className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold font-heading text-[#1A1A17]">
        No leads in your pipeline yet
      </h3>
      <p className="text-sm text-[#5C5A54] mt-1.5 max-w-sm mx-auto">
        Start tracking prospective customers by adding your first lead.
      </p>
      <div className="mt-5">
        <Button
          onClick={onAddLead}
          className="bg-[#0E7C66] hover:bg-[#0B6654] text-white inline-flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add your first lead</span>
        </Button>
      </div>
    </div>
  )
}

interface NoResultsStateProps {
  onResetFilters: () => void
}

export function NoResultsState({ onResetFilters }: NoResultsStateProps) {
  return (
    <div className="py-14 px-4 text-center">
      <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-3 text-[#8A8880]">
        <Search className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-semibold text-[#1A1A17]">
        No leads match your filter
      </h3>
      <p className="text-xs text-[#5C5A54] mt-1 max-w-xs mx-auto">
        Try checking for spelling errors, changing the status tab, or clearing filters.
      </p>
      <div className="mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onResetFilters}
          className="text-xs"
        >
          Clear filters
        </Button>
      </div>
    </div>
  )
}

interface ErrorStateProps {
  message?: string
  onRetry: () => void
}

export function ErrorState({
  message = "Failed to load leads from the server.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="py-14 px-4 text-center">
      <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3 text-red-600">
        <AlertCircle className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-semibold text-[#1A1A17]">Connection error</h3>
      <p className="text-xs text-[#5C5A54] mt-1 max-w-sm mx-auto">{message}</p>
      <div className="mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 text-xs text-[#1A1A17]"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </Button>
      </div>
    </div>
  )
}

export function TableLoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="divide-y divide-[#E7E3DB]">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 flex items-center justify-between gap-4 animate-pulse">
          <div className="space-y-2 w-1/4">
            <div className="h-4 bg-stone-200 rounded w-3/4" />
            <div className="h-3 bg-stone-100 rounded w-1/2" />
          </div>
          <div className="h-4 bg-stone-100 rounded w-1/5 hidden sm:block" />
          <div className="h-4 bg-stone-100 rounded w-1/6 hidden md:block" />
          <div className="h-5 bg-stone-200 rounded-full w-20" />
          <div className="h-4 bg-stone-100 rounded w-16" />
        </div>
      ))}
    </div>
  )
}
