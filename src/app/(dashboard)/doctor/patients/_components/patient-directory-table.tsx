"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Users, ChevronRight, Mail, Calendar, Hash } from "lucide-react";

export interface PatientRecord {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  avatar_url?: string | null;
  phone?: string | null;
}

interface PatientDirectoryTableProps {
  patients: PatientRecord[];
}

export function PatientDirectoryTable({ patients }: PatientDirectoryTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPatients = patients.filter((patient) => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return true;

    const nameMatch = patient.full_name.toLowerCase().includes(query);
    const emailMatch = patient.email.toLowerCase().includes(query);
    const idMatch = patient.id.toLowerCase().includes(query);

    return nameMatch || emailMatch || idMatch;
  });

  return (
    <div className="space-y-6">
      {/* ── Search Bar Controls ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, or patient ID..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 transition-all shadow-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Clear
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Showing <span className="font-semibold text-slate-900 dark:text-white">{filteredPatients.length}</span> of{" "}
          <span className="font-semibold text-slate-900 dark:text-white">{patients.length}</span> registered patients
        </div>
      </div>

      {/* ── Table / Empty State ── */}
      {filteredPatients.length === 0 ? (
        <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700/60 text-slate-400 dark:text-slate-500 flex items-center justify-center mb-4">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            No patients found
          </h3>
          <p className="mt-1.5 text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-sm">
            {searchTerm
              ? `No patient records match the search "${searchTerm}". Try searching by another keyword.`
              : "There are currently no patients registered in the directory."}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="mt-4 px-4 py-2 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
            >
              Reset Search
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Patient Name &amp; Email</th>
                  <th className="px-6 py-4">Patient ID</th>
                  <th className="px-6 py-4">Registered Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {filteredPatients.map((patient) => {
                  const shortId = `PT-${patient.id.slice(0, 8)}`;
                  const initials =
                    patient.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase() || "PT";

                  return (
                    <tr
                      key={patient.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors group"
                    >
                      {/* Name & Email */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 text-white font-semibold text-xs flex items-center justify-center shadow-sm flex-shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                              {patient.full_name}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              <span>{patient.email}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Truncated Patient ID */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 font-mono text-xs font-medium border border-slate-200/60 dark:border-slate-600/40">
                          <Hash className="w-3 h-3 text-slate-400" />
                          {shortId}
                        </span>
                      </td>

                      {/* Registered Date */}
                      <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {new Date(patient.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Action Button */}
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/doctor/patients/${patient.id}/records`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:border-teal-500 dark:hover:border-teal-400 hover:text-teal-600 dark:hover:text-teal-400 rounded-lg shadow-sm transition-all"
                        >
                          <span>View Record</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
