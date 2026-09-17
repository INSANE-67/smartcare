"use client";

import { useState } from "react";
import { Sparkles, Brain, Loader2, CheckCircle2, RefreshCw } from "lucide-react";

interface PatientAiSummarizerProps {
  patientName: string;
}

export function PatientAiSummarizer({ patientName }: PatientAiSummarizerProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  const handleGenerate = () => {
    setIsGenerating(true);
    setSummary(null);

    // Simulate AI clinical analysis
    setTimeout(() => {
      setIsGenerating(false);
      setSummary(
        `Clinical Summary for ${patientName}:
• Overall Status: Patient is stable with controlled vitals.
• Cardiovascular: Resting heart rate within normal range (72 bpm). Last BP reading: 122/80 mmHg.
• Laboratory Findings: Recent lipid panel (Oct 2026) indicates optimal HDL (58 mg/dL) and LDL (94 mg/dL). Fasting glucose is normal at 92 mg/dL.
• Allergies & Alerts: Documented sensitivity to Penicillin. No drug-drug interactions detected with current regimen.
• Recommendation: Schedule routine 6-month checkup; continue maintenance therapy.`
      );
    }, 1200);
  };

  return (
    <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500/20 to-emerald-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Brain className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              AI Summarizer
            </h3>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
            Med-PaLM 2
          </span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
          Synthesize clinical notes, lab results, and telemetry data into a standardized EHR brief.
        </p>

        {/* AI Output Area */}
        <div className="min-h-[140px] p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/70 text-xs text-slate-700 dark:text-slate-300 font-mono leading-relaxed whitespace-pre-line">
          {isGenerating ? (
            <div className="h-[120px] flex flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin text-teal-600 dark:text-teal-400" />
              <span>Analyzing patient EHR &amp; telemetry…</span>
            </div>
          ) : summary ? (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>AI Clinical Analysis Complete</span>
              </div>
              <div className="text-slate-800 dark:text-slate-200">{summary}</div>
            </div>
          ) : (
            <p className="text-slate-400 dark:text-slate-500 italic flex items-center justify-center h-[120px] text-center">
              Click &quot;Generate Clinical Summary&quot; to analyze patient records and generate instant clinical highlights.
            </p>
          )}
        </div>
      </div>

      <div className="mt-5">
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-emerald-950/30 hover:shadow-emerald-600/20 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Synthesizing EHR Data…</span>
            </>
          ) : summary ? (
            <>
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate Summary</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Clinical Summary</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
