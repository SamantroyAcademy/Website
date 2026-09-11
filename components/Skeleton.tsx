/** Loading placeholders shaped like the real layout (no generic spinners). */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-tint ${className}`} aria-hidden />;
}

/** Public page skeleton: page hero + a card grid. Shown by app/(site)/loading.tsx. */
export function PageSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="container-x pt-28 pb-16 sm:pt-36">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-6 h-12 w-3/4 max-w-3xl sm:h-16" />
        <Skeleton className="mt-3 h-12 w-1/2 max-w-2xl sm:h-16" />
        <Skeleton className="mt-6 h-5 w-full max-w-xl" />
      </div>
      <div className="container-x pb-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-5">
              <Skeleton className="aspect-[4/3] w-full" />
              <Skeleton className="mt-4 h-5 w-2/3" />
              <Skeleton className="mt-2 h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Admin dashboard skeleton. */
export function AdminSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="h-8 w-56 animate-pulse rounded-lg bg-slate-200" />
      <div className="mt-2 h-4 w-80 max-w-full animate-pulse rounded bg-slate-200" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-200" />)}
      </div>
      <div className="mt-8 space-y-3 rounded-xl border border-slate-200 bg-white p-6">
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />)}
      </div>
    </div>
  );
}
