export function SidebarRowsSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2 px-2 py-2" aria-label="Loading sidebar items">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex h-8 items-center gap-2">
          <div className="size-4 shrink-0 animate-pulse rounded bg-muted" />
          <div
            className={`h-3 animate-pulse rounded bg-muted ${
              index === rows - 1 ? "w-2/5" : "w-3/4"
            }`}
          />
        </div>
      ))}
    </div>
  );
}

export function SidebarProfileSkeleton() {
  return (
    <div
      className="flex items-center gap-3 rounded-xl px-2.5 py-2.5"
      aria-label="Loading account"
    >
      <div className="size-9 shrink-0 animate-pulse rounded-full bg-muted" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-3.5 w-24 animate-pulse rounded bg-muted" />
        <div className="h-3 w-32 max-w-full animate-pulse rounded bg-muted" />
      </div>
      <div className="size-4 animate-pulse rounded bg-muted" />
    </div>
  );
}
