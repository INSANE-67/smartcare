import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "./auth";

export interface DoctorProfileInfo {
  id: string;
  fullName: string;
  doctorDisplayName: string;
  specialty: string;
  department: string | null;
  clinicName: string | null;
  clinicAddress: string | null;
  yearsOfExperience: number | null;
  licenseNumber: string | null;
  bio: string | null;
  isVerified: boolean;
  avatarUrl: string | null;
  email: string | null;
}

export interface DoctorDashboardStats {
  todayAppointmentsCount: number;
  waitingRoomCount: number;
  pendingReviewsCount: number;
  aiSummariesCount: number;
}

export interface DoctorTodayAppointmentItem {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number | null;
  patientGender: string | null;
  appointmentDate: string;
  dateBadge: string;
  time: string;
  duration: string;
  type: string;
  status: string;
  statusColor: string;
  isUrgent: boolean;
}

export interface DoctorAiInsightItem {
  id: string;
  type: "summary" | "alert" | "note";
  title: string;
  description: string;
  time: string;
  badge: string;
  badgeColor: string;
}

interface ProfileDbRow {
  id: string;
  full_name: string;
  avatar_url: string | null;
  phone?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  is_active?: boolean | null;
  is_verified?: boolean | null;
}

interface DoctorDbRow {
  id: string;
  profile_id: string;
  license_number?: string | null;
  specialty?: string | null;
  department?: string | null;
  years_of_experience?: number | null;
  bio?: string | null;
  is_verified?: boolean | null;
  clinic_name?: string | null;
  clinic_address?: string | null;
  is_accepting_appointments?: boolean | null;
  appointment_duration?: number | null;
}

interface AppointmentDbRow {
  id: string;
  patient_id: string;
  doctor_id?: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  reason: string | null;
  notes: string | null;
}

/**
 * Returns complete live dashboard data for the authenticated doctor.
 * Queries Supabase using authenticated doctor context with full appointment lifecycle visibility.
 */
export async function getDoctorDashboardData(): Promise<{
  doctorInfo: DoctorProfileInfo;
  stats: DoctorDashboardStats;
  todayAppointments: DoctorTodayAppointmentItem[];
  insights: DoctorAiInsightItem[];
}> {
  const user = await getCurrentUser();
  if (!user || user.role !== "doctor") {
    return {
      doctorInfo: {
        id: "",
        fullName: "Doctor",
        doctorDisplayName: "Dr. Specialist",
        specialty: "General Practice",
        department: null,
        clinicName: null,
        clinicAddress: null,
        yearsOfExperience: null,
        licenseNumber: null,
        bio: null,
        isVerified: false,
        avatarUrl: null,
        email: null,
      },
      stats: {
        todayAppointmentsCount: 0,
        waitingRoomCount: 0,
        pendingReviewsCount: 0,
        aiSummariesCount: 0,
      },
      todayAppointments: [],
      insights: [],
    };
  }

  const supabase = await createSupabaseServerClient();

  // 1. Fetch Doctor Profile & doctors record in parallel
  const [profileRes, doctorRes] = (await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, avatar_url, phone, date_of_birth, gender, is_active, is_verified")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("doctors")
      .select("id, profile_id, license_number, specialty, department, years_of_experience, bio, is_verified, clinic_name, clinic_address, is_accepting_appointments, appointment_duration")
      .eq("profile_id", user.id)
      .maybeSingle(),
  ])) as [
    { data: ProfileDbRow | null; error: { message?: string; code?: string } | null },
    { data: DoctorDbRow | null; error: { message?: string; code?: string } | null }
  ];

  if (profileRes.error) {
    console.error("[Supabase Query Error] Table 'profiles' failed:", {
      error: profileRes.error,
      message: profileRes.error.message,
      code: profileRes.error.code,
      userId: user.id,
    });
  }

  if (doctorRes.error) {
    console.error("[Supabase Query Error] Table 'doctors' failed:", {
      error: doctorRes.error,
      message: doctorRes.error.message,
      code: doctorRes.error.code,
      userId: user.id,
    });
  }

  const profileRow = profileRes.data;
  const docRow = doctorRes.data;

  // Format clean doctor display name
  const rawName = (profileRow?.full_name || user.full_name || "").trim();
  const cleanedName = rawName.replace(/^(dr\.?|doctor)\s+/i, "").trim();
  const doctorDisplayName = cleanedName ? `Dr. ${cleanedName}` : "Dr. Specialist";

  // Coerce specialty to a plain string — guards against Supabase returning a
  // joined object when schema relations are present (would cause React #441).
  const rawSpecialty = docRow?.specialty;
  const specialtyStr: string =
    typeof rawSpecialty === "string" && rawSpecialty.trim()
      ? rawSpecialty.trim()
      : "General Practice";

  const doctorInfo: DoctorProfileInfo = {
    id: user.id,
    fullName: rawName || "Doctor",
    doctorDisplayName,
    specialty: specialtyStr,
    department: typeof docRow?.department === "string" ? docRow.department : null,
    clinicName: typeof docRow?.clinic_name === "string" ? docRow.clinic_name : null,
    clinicAddress: typeof docRow?.clinic_address === "string" ? docRow.clinic_address : null,
    yearsOfExperience: docRow?.years_of_experience ?? null,
    licenseNumber: typeof docRow?.license_number === "string" ? docRow.license_number : null,
    bio: typeof docRow?.bio === "string" ? docRow.bio : null,
    isVerified: docRow?.is_verified ?? user.is_verified ?? false,
    avatarUrl: profileRow?.avatar_url || user.avatar_url || null,
    email: user.email || null,
  };

  // Resolve all identifiers associated with this doctor (profiles.id and doctors.id)
  const doctorMatchIds = Array.from(new Set([user.id, docRow?.id].filter(Boolean))) as string[];

  // Handle timezone alignment between local date and UTC
  const now = new Date();
  const localTodayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const utcTodayStr = now.toISOString().split("T")[0];
  const targetDates = Array.from(new Set([localTodayStr, utcTodayStr]));

  // 2. Fetch all appointments and consultation notes for this doctor
  const [aptsRes, consultationNotesCountRes, recentNotesRes] = (await Promise.all([
    supabase
      .from("appointments")
      .select("id, patient_id, doctor_id, appointment_date, appointment_time, status, reason, notes")
      .neq("status", "cancelled")
      .neq("status", "rejected")
      .order("appointment_date", { ascending: true })
      .order("appointment_time", { ascending: true }),
    supabase
      .from("consultation_notes")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("consultation_notes")
      .select("id, appointment_id, patient_id, diagnosis, symptoms, observations, treatment_plan, follow_up_date, created_at")
      .order("created_at", { ascending: false })
      .limit(4),
  ])) as [
    { data: AppointmentDbRow[] | null; error: { message?: string; code?: string } | null },
    { count: number | null; error: { message?: string; code?: string } | null },
    {
      data: {
        id: string;
        appointment_id: string;
        patient_id: string;
        diagnosis: string | null;
        symptoms: string | null;
        observations: string | null;
        treatment_plan: string | null;
        follow_up_date: string | null;
        created_at: string;
      }[] | null;
      error: { message?: string; code?: string } | null;
    }
  ];

  if (aptsRes.error) {
    console.error("[Supabase Query Error] Table 'appointments' failed:", {
      error: aptsRes.error,
      message: aptsRes.error.message,
      code: aptsRes.error.code,
      doctorMatchIds,
    });
  }

  const rawApts = aptsRes.data || [];
  // Filter by doctor match IDs if doctor_id field is present in return
  const allDoctorApts = rawApts.filter(
    (a) => !a.doctor_id || doctorMatchIds.includes(a.doctor_id)
  );

  console.log("===== FILTER DEBUG =====");
  console.log("targetDates:", targetDates);
  console.log("allDoctorApts:", allDoctorApts);
  
  for (const a of allDoctorApts) {
    console.log({
      id: a.id,
      appointment_date: a.appointment_date,
      typeofDate: typeof a.appointment_date,
      includes: targetDates.includes(a.appointment_date),
      raw: JSON.stringify(a.appointment_date)
    });
  }
  
  const todayApts = allDoctorApts.filter((a) => targetDates.includes(a.appointment_date));
  console.log("todayApts:", todayApts);
  const upcomingApts = allDoctorApts.filter((a) => !targetDates.includes(a.appointment_date));

  // Determine displayed appointments: all active encounters up to 8
  const displayedApts = allDoctorApts.slice(0, 8);

  const todayAppointmentsCount = todayApts.length;
  const pendingReviewsCount = allDoctorApts.filter(
    (a) => (a.status || "").toLowerCase() === "pending"
  ).length;
  const waitingRoomCount = allDoctorApts.filter(
    (a) => (a.status || "").toLowerCase() === "confirmed"
  ).length;
  const aiSummariesCount = consultationNotesCountRes.count ?? 0;

  console.log("[Doctor Dashboard Query]", {
    doctorId: user.id,
    doctorMatchIds,
    targetDates,
    totalActiveApts: allDoctorApts.length,
    todayAptsCount: todayAppointmentsCount,
    pendingReviewsCount,
    waitingRoomCount,
  });

  // 3. Fetch associated patient profiles directly using patient_id
  const patientIds = Array.from(new Set(displayedApts.map((a) => a.patient_id).filter(Boolean)));
  let patientMap = new Map<string, { id: string; full_name: string; avatar_url: string | null; date_of_birth: string | null; gender: string | null }>();

  if (patientIds.length > 0) {
    const { data: patientProfiles, error: patientError } = (await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, date_of_birth, gender")
      .in("id", patientIds)) as {
        data: { id: string; full_name: string; avatar_url: string | null; date_of_birth: string | null; gender: string | null }[] | null;
        error: { message?: string; code?: string } | null;
      };

    if (patientError) {
      console.error("[Supabase Query Error] Table 'profiles' for appointment patients failed:", {
        error: patientError,
        message: patientError.message,
        code: patientError.code,
        patientIds,
      });
    } else if (patientProfiles) {
      patientMap = new Map(patientProfiles.map((p) => [p.id, p]));
    }
  }

  const todayAppointments: DoctorTodayAppointmentItem[] = displayedApts.map((apt) => {
    const patient = patientMap.get(apt.patient_id);
    const patientName = patient?.full_name?.trim() || "Patient";

    let patientAge: number | null = null;
    if (patient?.date_of_birth) {
      const birthDate = new Date(patient.date_of_birth);
      const ageDiff = Date.now() - birthDate.getTime();
      patientAge = Math.floor(ageDiff / (1000 * 60 * 60 * 24 * 365.25));
    }

    const isUrgent = !!(
      apt.reason?.toLowerCase().includes("urgent") ||
      apt.reason?.toLowerCase().includes("emergency") ||
      apt.notes?.toLowerCase().includes("urgent")
    );

    let statusColor = "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    if (apt.status === "confirmed") {
      statusColor = "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800";
    } else if (apt.status === "completed") {
      statusColor = "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
    } else if (apt.status === "pending") {
      statusColor = "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800";
    }

    // Guard against null/undefined appointment_date before calling formatDateBadge
    const dateBadge = apt.appointment_date
      ? formatDateBadge(apt.appointment_date, localTodayStr)
      : "";

    return {
      id: apt.id,
      patientId: apt.patient_id,
      patientName,
      patientAge,
      patientGender:
        patient?.gender
          ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)
          : null,
      appointmentDate: apt.appointment_date ?? "",
      dateBadge,
      time: apt.appointment_time ? apt.appointment_time.slice(0, 5) : "—",
      duration: docRow?.appointment_duration
        ? `${docRow.appointment_duration} min`
        : "30 min",
      type: typeof apt.reason === "string" && apt.reason.trim()
        ? apt.reason.trim()
        : "Consultation",
      status: apt.status
        ? apt.status.charAt(0).toUpperCase() + apt.status.slice(1)
        : "Pending",
      statusColor,
      isUrgent,
    };
  });

  // 4. Query recent clinical insights / consultation notes strictly for this doctor
  const notesList = recentNotesRes.data || [];
  const notePatientIds = Array.from(new Set(notesList.map((n) => n.patient_id).filter(Boolean)));

  let notePatientMap = new Map<string, string>();
  if (notePatientIds.length > 0) {
    const { data: notePatients, error: notePatientError } = (await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", notePatientIds)) as {
        data: { id: string; full_name: string }[] | null;
        error: { message?: string; code?: string } | null;
      };

    if (notePatientError) {
      console.error("[Supabase Query Error] Table 'profiles' for note patients failed:", {
        error: notePatientError,
        message: notePatientError.message,
        code: notePatientError.code,
        notePatientIds,
      });
    } else if (notePatients) {
      notePatientMap = new Map(notePatients.map((p) => [p.id, p.full_name]));
    }
  }

  const insights: DoctorAiInsightItem[] = notesList.map((note) => {
    // Guard against null/missing created_at — fall back to current time
    const createdAtDate = note.created_at ? new Date(note.created_at) : new Date();
    const timeAgo = isNaN(createdAtDate.getTime()) ? "Recently" : formatTimeAgo(createdAtDate);

    const patientName = notePatientMap.get(note.patient_id);

    // Coerce diagnosis/treatment strings to avoid rendering raw objects
    const diagnosisStr = typeof note.diagnosis === "string" ? note.diagnosis.trim() : "";
    const title = diagnosisStr
      ? patientName
        ? `${patientName} — ${diagnosisStr}`
        : `Diagnosis: ${diagnosisStr}`
      : patientName
        ? `${patientName} — Clinical Note`
        : "Clinical Consultation Note";

    const description =
      (typeof note.treatment_plan === "string" && note.treatment_plan.trim()) ||
      (typeof note.observations === "string" && note.observations.trim()) ||
      (typeof note.symptoms === "string" && note.symptoms.trim()) ||
      "Consultation encounter record documented for patient chart.";

    return {
      id: note.id,
      type: "summary",
      title,
      description,
      time: timeAgo,
      badge:
        typeof note.follow_up_date === "string" && note.follow_up_date
          ? `Follow-up: ${note.follow_up_date}`
          : "Clinical Note",
      badgeColor: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
    };
  });

  return {
    doctorInfo,
    stats: {
      todayAppointmentsCount,
      waitingRoomCount,
      pendingReviewsCount,
      aiSummariesCount,
    },
    todayAppointments,
    insights,
  };
}

function formatDateBadge(dateStr: string, todayStr: string): string {
  if (dateStr === todayStr) return "Today";
  try {
    const [y, m, d] = dateStr.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    const [ty, tm, td] = todayStr.split("-").map(Number);
    const todayObj = new Date(ty, tm - 1, td);
    const diffDays = Math.round((dateObj.getTime() - todayObj.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return "Tomorrow";
    return dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
