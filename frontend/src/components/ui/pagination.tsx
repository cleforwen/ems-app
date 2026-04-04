import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/utils"

export interface PaginationProps {
  page: number
  size: number
  total: number
  totalPages: number
  onPageChange: (page: number) => void
  onSizeChange?: (size: number) => void
  pageSizeOptions?: number[]
}

export function Pagination({
  page,
  size,
  total,
  totalPages,
  onPageChange,
  onSizeChange,
  pageSizeOptions = [10, 20, 50],
}: PaginationProps) {
  const startItem = total === 0 ? 0 : page * size + 1
  const endItem = Math.min((page + 1) * size, total)

  const canGoPrevious = page > 0
  const canGoNext = page < totalPages - 1

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = []
    const showEllipsis = totalPages > 7

    if (!showEllipsis) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (page < 4) {
        for (let i = 0; i < 5; i++) {
          pages.push(i)
        }
        pages.push("ellipsis")
        pages.push(totalPages - 1)
      } else if (page > totalPages - 5) {
        pages.push(0)
        pages.push("ellipsis")
        for (let i = totalPages - 5; i < totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(0)
        pages.push("ellipsis")
        for (let i = page - 1; i <= page + 1; i++) {
          pages.push(i)
        }
        pages.push("ellipsis")
        pages.push(totalPages - 1)
      }
    }

    return pages
  }

  if (totalPages <= 1 && total <= size) {
    return null
  }

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="flex items-center gap-4">
        {onSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Show</span>
            <select
              value={size}
              onChange={(e) => onSizeChange(Number(e.target.value))}
              className="h-8 w-16 rounded-md border border-input bg-background text-sm"
            >
              {pageSizeOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <span className="text-sm text-muted-foreground">entries</span>
          </div>
        )}
        {total > 0 && (
          <span className="text-sm text-muted-foreground">
            Showing {startItem} to {endItem} of {total} entries
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(0)}
          disabled={!canGoPrevious}
          className="hidden sm:flex"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={!canGoPrevious}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-1 px-2">
          {getPageNumbers().map((p, index) =>
            p === "ellipsis" ? (
              <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                ...
              </span>
            ) : (
              <Button
                key={p}
                variant={p === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(p)}
                className={cn("min-w-[36px]", p === page && "pointer-events-none")}
              >
                {p + 1}
              </Button>
            )
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={!canGoNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages - 1)}
          disabled={!canGoNext}
          className="hidden sm:flex"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
