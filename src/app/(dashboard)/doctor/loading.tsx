export default function DoctorDashboardLoading() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 md:p-6 lg:p-8 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-5 w-28 bg-slate-200 dark:bg-slate-800 rounded-full" />
          <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-9 w-36 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        </div>
      </div>

      {/* Metrics skeleton (3 columns) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 p-6 flex items-center gap-5"
          >
            <div className="w-14 h-14 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            <div className="space-y-2 flex-1">
              <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-7 w-12 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
          <div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="space-y-3 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-100 dark:bg-slate-700/40 rounded-xl" />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-3">
            <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-12 bg-slate-100 dark:bg-slate-700/40 rounded-lg" />
            <div className="h-12 bg-slate-100 dark:bg-slate-700/40 rounded-lg" />
          </div>

          <div className="bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-3">
            <div className="h-5 w-36 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-20 bg-slate-100 dark:bg-slate-700/40 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
