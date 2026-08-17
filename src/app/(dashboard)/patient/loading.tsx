export default function PatientLoading() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-48 bg-white/5 rounded-md mb-2"></div>
          <div className="h-4 w-64 bg-white/5 rounded-md"></div>
        </div>
        <div className="h-10 w-32 bg-white/5 rounded-lg"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-white/5 border border-white/5 rounded-2xl"></div>
        ))}
      </div>

      <div className="h-[400px] bg-white/5 border border-white/5 rounded-2xl w-full"></div>
    </div>
  );
}
