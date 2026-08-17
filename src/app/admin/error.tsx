"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin Portal Error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center bg-zinc-900 border border-red-500/20 rounded-2xl">
      <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Admin Portal Error</h2>
      <p className="text-gray-400 text-sm max-w-sm mb-6">
        {error.message || "An unexpected error occurred while loading admin data."}
      </p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-white text-black font-medium rounded-md hover:bg-gray-200 transition-colors"
      >
        Reload Page
      </button>
    </div>
  );
}
