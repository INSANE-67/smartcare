"use client";

import { useState } from "react";
import { requestConnectionAction } from "@/lib/actions/relationships";

export function RequestConnectionForm({ doctorId }: { doctorId: string }) {
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function onSubmit(formData: FormData) {
    setIsPending(true);
    setMessage(null);
    
    const result = await requestConnectionAction(null, formData);
    
    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else if (result?.success) {
      setMessage({ type: "success", text: result.success });
    }
    
    setIsPending(false);
  }

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mt-8">
      <h3 className="text-lg font-semibold text-slate-900 mb-2">Request Connection</h3>
      <p className="text-sm text-slate-600 mb-4">
        Send a request to connect with this doctor. Once accepted, they will become part of your care team.
      </p>

      {message && (
        <div
          className={`p-4 mb-4 text-sm rounded-lg ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {message?.type !== "success" && (
        <form action={onSubmit} className="space-y-4">
          <input type="hidden" name="doctorId" value={doctorId} />
          
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1">
              Message (Optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="Briefly describe why you're requesting a connection..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
              maxLength={1000}
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto px-6 py-2 bg-brand-500 text-white font-medium rounded-lg hover:bg-brand-600 focus:ring-4 focus:ring-brand-100 disabled:opacity-50 transition-colors"
          >
            {isPending ? "Sending..." : "Send Request"}
          </button>
        </form>
      )}
    </div>
  );
}
