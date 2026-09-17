"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";

interface DoctorSearchBarProps {
  initialSearch?: string;
  initialSpecialty?: string;
  placeholder?: string;
}

export function DoctorSearchBar({
  initialSearch = "",
  initialSpecialty = "",
  placeholder = "Search by name, specialty, or department…",
}: DoctorSearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState(
    () => searchParams.get("search") || initialSearch
  );
  const [specialty, setSpecialty] = useState(
    () => searchParams.get("specialty") || initialSpecialty
  );

  // Debounced URL update
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentSearch = searchParams.get("search") || "";
      const currentSpecialty = searchParams.get("specialty") || "";

      if (
        searchTerm.trim() !== currentSearch ||
        specialty.trim() !== currentSpecialty
      ) {
        const params = new URLSearchParams(searchParams.toString());
        searchTerm.trim()
          ? params.set("search", searchTerm.trim())
          : params.delete("search");
        specialty.trim()
          ? params.set("specialty", specialty.trim())
          : params.delete("specialty");
        params.delete("page");

        startTransition(() => {
          router.replace(`${pathname}?${params.toString()}`);
        });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, specialty, pathname, router, searchParams]);

  const handleClear = () => {
    setSearchTerm("");
    setSpecialty("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    params.delete("specialty");
    params.delete("page");
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  const inputClass =
    "w-full bg-white border border-[#E8DED2] rounded-xl px-3.5 py-2.5 text-sm text-[#111111] placeholder:text-[#AAAAAA] focus:outline-none focus:border-[#111111] focus:ring-2 focus:ring-[#111111]/10 transition-all";

  return (
    <div className="bg-white border border-[#E8DED2] rounded-2xl p-4 shadow-xs">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Name / keyword search */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#777777]" />
            ) : (
              <Search className="w-4 h-4 text-[#AAAAAA]" />
            )}
          </div>
          <input
            id="doctor-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={placeholder}
            className={`${inputClass} pl-10 pr-10`}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#AAAAAA] hover:text-[#111111] transition-colors"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Specialty filter */}
        <div className="relative sm:w-60">
          <input
            id="specialty-search-input"
            type="text"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            placeholder="Specialty (e.g. Cardiology)"
            className={`${inputClass} pr-10`}
          />
          {specialty && (
            <button
              type="button"
              onClick={() => setSpecialty("")}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#AAAAAA] hover:text-[#111111] transition-colors"
              title="Clear specialty"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Clear all */}
        {(searchTerm || specialty) && (
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2.5 bg-[#FAF7F2] hover:bg-[#F0EBE3] border border-[#E8DED2] text-[#555555] text-xs font-semibold rounded-xl transition-colors shrink-0"
          >
            Clear All
          </button>
        )}
      </div>
    </div>
  );
}
