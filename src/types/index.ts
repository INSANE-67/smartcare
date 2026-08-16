/**
 * Shared application-level TypeScript types for SmartCare.
 *
 * Database row types live in src/types/database.ts.
 * This file re-exports the commonly used ones and adds
 * application-specific types (DTOs, API responses, etc.).
 */

// Re-export database enums and rows used throughout the app
export type {
  UserRole,
  BloodType,
  Gender,
  RelationshipStatus,
  InitiatorRole,
  ProfileRow,
  DoctorRow,
  DoctorInsert,
  DoctorUpdate,
  DoctorAdminUpdate,
  DoctorPatientRelationshipRow,
  PatientProfileRow,
  AuditLogRow,
  Database,
  PrescriptionRow,
  PrescriptionStatus,
  ConsultationNoteRow,
} from "./database";

// ─────────────────────────────────────────────────────────────────────────────
// Generic API response wrapper
// ─────────────────────────────────────────────────────────────────────────────

export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export type ActionResponse<T> = ApiResult<T>;

// ─────────────────────────────────────────────────────────────────────────────
// Data Transfer Objects (DTOs)
// Minimal, safe shapes returned by the Data Access Layer.
// Never include fields that could leak sensitive internal state.
// ─────────────────────────────────────────────────────────────────────────────

/** Minimal profile info safe to pass to Client Components */
export interface ProfileDTO {
  id: string;
  role: import("./database").UserRole;
  full_name: string;
  avatar_url: string | null;
  is_active: boolean;
}

/** Doctor directory entry — visible to all authenticated users */
export interface DoctorDirectoryDTO {
  profile_id: string;
  full_name: string;
  avatar_url: string | null;
  specialty: string;
  department: string | null;
  bio: string | null;
  years_of_experience: number | null;
}
