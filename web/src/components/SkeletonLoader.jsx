export function SkeletonText({ lines = 1, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded animate-pulse"
          style={{
            width: i === lines - 1 ? '80%' : '100%',
          }}
        />
      ))}
    </div>
  );
}

export function SkeletonItem() {
  return (
    <div className="border rounded-lg p-4 bg-white border-e2e8f0 space-y-3 animate-pulse">
      <div className="flex justify-between">
        <div className="h-5 bg-slate-200 rounded w-1/3" />
        <div className="h-5 bg-slate-200 rounded w-1/6" />
      </div>
      <div className="h-4 bg-slate-200 rounded w-2/3" />
      <div className="h-3 bg-slate-100 rounded w-1/2" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonItem key={i} />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`bg-white rounded-lg p-6 border border-e2e8f0 space-y-4 animate-pulse ${className}`}>
      <div className="h-6 bg-slate-200 rounded w-1/3" />
      <div className="space-y-3">
        <div className="h-4 bg-slate-200 rounded" />
        <div className="h-4 bg-slate-200 rounded w-5/6" />
        <div className="h-4 bg-slate-200 rounded w-4/6" />
      </div>
    </div>
  );
}
