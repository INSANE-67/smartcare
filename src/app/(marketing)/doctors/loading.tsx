export default function DoctorsDirectoryLoading() {
  return (
    <div className="container mx-auto px-4 py-12 animate-pulse">
      <div className="h-10 w-48 bg-white/5 rounded-md mb-8"></div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 h-64">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-white/10"></div>
              <div className="flex-1 space-y-3">
                <div className="h-6 w-3/4 bg-white/10 rounded"></div>
                <div className="h-4 w-1/2 bg-white/10 rounded"></div>
                <div className="h-4 w-1/3 bg-white/10 rounded"></div>
              </div>
            </div>
            <div className="mt-8 space-y-3">
              <div className="h-10 w-full bg-white/10 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
