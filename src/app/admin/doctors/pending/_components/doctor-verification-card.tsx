"use client";

import { useState } from "react";
import { toast } from "sonner";
import { approveDoctorAction, rejectDoctorAction } from "@/lib/actions/admin";
import type { AdminPendingDoctor } from "@/lib/dal/admin";
import { Check, X, FileText, Briefcase, MapPin, Loader2 } from "lucide-react";
import Image from "next/image";

export function DoctorVerificationCard({ doctor }: { doctor: AdminPendingDoctor }) {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [error, setError] = useState("");

  const handleApprove = async () => {
    setIsApproving(true);
    setError("");
    const res = await approveDoctorAction(doctor.id);
    if (!res.success) {
      setError(res.error || "Failed to approve doctor.");
      toast.error(res.error || "Failed to approve doctor.");
    } else {
      toast.success("Doctor application approved successfully!");
    }
    setIsApproving(false);
  };

  const handleReject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsRejecting(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    formData.append("doctorId", doctor.id);
    const res = await rejectDoctorAction(formData);
    if (!res.success) {
      setError(res.error || "Failed to reject doctor.");
      toast.error(res.error || "Failed to reject doctor.");
    } else {
      toast.success("Doctor application has been rejected.");
      setShowRejectForm(false);
    }
    setIsRejecting(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      <div className="p-6 flex-1">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            {doctor.profiles.avatar_url ? (
              <Image src={doctor.profiles.avatar_url} alt={doctor.profiles.full_name} width={64} height={64} className="w-16 h-16 rounded-full object-cover border border-slate-200" unoptimized />
            ) : (
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                {doctor.profiles.full_name.charAt(0)}
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold text-slate-900">{doctor.profiles.full_name}</h3>
              <p className="text-sm text-slate-500">Joined {new Date(doctor.profiles.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold uppercase rounded-full tracking-wider">
            Pending Review
          </span>
        </div>

        <div className="space-y-3 mt-6 border-t border-slate-100 pt-6">
          <div className="flex items-start text-sm">
            <Briefcase className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
            <div>
              <span className="font-semibold text-slate-700 block">Specialty & Experience</span>
              <span className="text-slate-600">{doctor.specialty} • {doctor.years_of_experience || 0} years experience</span>
            </div>
          </div>
          
          <div className="flex items-start text-sm">
            <FileText className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
            <div>
              <span className="font-semibold text-slate-700 block">License Number</span>
              <span className="text-slate-600 font-mono bg-slate-100 px-1 py-0.5 rounded">{doctor.license_number}</span>
            </div>
          </div>

          <div className="flex items-start text-sm">
            <MapPin className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
            <div>
              <span className="font-semibold text-slate-700 block">Clinic Details</span>
              <span className="text-slate-600">{doctor.clinic_name || "Independent"} — {doctor.clinic_address || "No address provided"}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
            {error}
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 bg-slate-50 p-6">
        {!showRejectForm ? (
          <div className="flex space-x-3">
            <button 
              onClick={() => setShowRejectForm(true)}
              disabled={isApproving}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 bg-white rounded-lg hover:bg-slate-50 font-medium transition-colors disabled:opacity-50 flex justify-center items-center"
            >
              <X className="w-4 h-4 mr-2" /> Reject
            </button>
            <button 
              onClick={handleApprove}
              disabled={isApproving}
              className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium transition-colors disabled:opacity-50 flex justify-center items-center shadow-sm"
            >
              {isApproving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-2" /> Approve</>}
            </button>
          </div>
        ) : (
          <form onSubmit={handleReject} className="space-y-4">
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-slate-700 mb-1">
                Reason for Rejection
              </label>
              <textarea 
                id="reason"
                name="reason" 
                required 
                rows={2} 
                className="w-full rounded-lg border-slate-300 border p-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                placeholder="E.g., Invalid license number provided."
              />
            </div>
            <div className="flex space-x-3">
              <button 
                type="button"
                onClick={() => setShowRejectForm(false)}
                disabled={isRejecting}
                className="flex-1 px-4 py-2 text-slate-600 font-medium hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isRejecting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50 flex justify-center items-center shadow-sm"
              >
                {isRejecting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Confirm Rejection"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
