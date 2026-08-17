export default function AdminLoading() {
  return (
    <div className="animate-pulse space-y-6 w-full max-w-6xl mx-auto py-8 px-4">
      <div className="h-10 w-64 bg-white/5 rounded-md"></div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-white/5 border border-white/5 rounded-xl"></div>
        ))}
      </div>

      <div className="mt-8 space-y-4">
        <div className="h-8 w-48 bg-white/5 rounded-md"></div>
        <div className="h-[500px] w-full bg-white/5 border border-white/5 rounded-xl"></div>
      </div>
    </div>
  );
}
