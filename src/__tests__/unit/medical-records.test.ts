/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createRecordAction,
  updateRecordAction,
  deleteRecordAction,
} from '@/lib/actions/medical-records';
import * as authDal from '@/lib/dal/auth';
import * as medicalRecordsDal from '@/lib/dal/medical-records';
import * as serverSupabase from '@/lib/supabase/server';

describe('Electronic Health Records (EHR) Module', () => {
  let mockSupabase: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'doctor-123' } }, error: null }),
      },
      storage: {
        from: vi.fn().mockReturnValue({
          upload: vi.fn().mockResolvedValue({
            data: { path: 'patient-456/1724400000000_lab_report.pdf' },
            error: null,
          }),
          createSignedUrl: vi.fn().mockResolvedValue({
            data: { signedUrl: 'https://supabase.local/storage/v1/object/sign/medical-records/patient-456/1724400000000_lab_report.pdf?token=abc' },
            error: null,
          }),
          remove: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [
                  {
                    id: 'rec-1',
                    patient_id: 'patient-456',
                    doctor_id: 'doctor-123',
                    title: 'Comprehensive Metabolic Panel',
                    type: 'lab_result',
                    attachment_url: 'patient-456/1724400000000_lab_report.pdf',
                    record_date: '2026-08-20',
                    created_at: '2026-08-20T10:00:00Z',
                  },
                ],
                error: null,
              }),
            }),
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'rec-1',
                patient_id: 'patient-456',
                doctor_id: 'doctor-123',
                title: 'Comprehensive Metabolic Panel',
                type: 'lab_result',
                attachment_url: 'patient-456/1724400000000_lab_report.pdf',
                record_date: '2026-08-20',
                created_at: '2026-08-20T10:00:00Z',
              },
              error: null,
            }),
          }),
        }),
      }),
    };

    vi.spyOn(serverSupabase, 'createSupabaseServerClient').mockResolvedValue(mockSupabase as any);
  });

  describe('Record Creation & Uploads', () => {
    it('doctor should successfully create a medical record for a patient', async () => {
      vi.spyOn(authDal, 'getCurrentUser').mockResolvedValue({
        id: 'doctor-123',
        role: 'doctor',
      } as any);

      vi.spyOn(medicalRecordsDal, 'createMedicalRecord').mockResolvedValue({
        id: 'rec-1',
        patient_id: '550e8400-e29b-41d4-a716-446655440000',
        doctor_id: 'doctor-123',
        title: 'Complete Blood Count',
        type: 'lab_result',
        record_date: '2026-08-20',
        created_at: '2026-08-20T10:00:00Z',
        updated_at: '2026-08-20T10:00:00Z',
      } as any);

      const formData = new FormData();
      formData.append('patient_id', '550e8400-e29b-41d4-a716-446655440000');
      formData.append('title', 'Complete Blood Count');
      formData.append('type', 'lab_result');
      formData.append('record_date', '2026-08-20');
      formData.append('description', 'All markers within normal limits.');

      const result = await createRecordAction(null, formData);

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('rec-1');
    });

    it('patient cannot upload records to another patient account', async () => {
      vi.spyOn(authDal, 'getCurrentUser').mockResolvedValue({
        id: 'patient-123',
        role: 'patient',
      } as any);

      const formData = new FormData();
      formData.append('patient_id', '550e8400-e29b-41d4-a716-446655440000'); // Other patient ID
      formData.append('title', 'Self test');
      formData.append('type', 'lab_result');
      formData.append('record_date', '2026-08-20');

      const result = await createRecordAction(null, formData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unauthorized');
    });

    it('should reject invalid date format or missing title', async () => {
      vi.spyOn(authDal, 'getCurrentUser').mockResolvedValue({
        id: 'doctor-123',
        role: 'doctor',
      } as any);

      const formData = new FormData();
      formData.append('patient_id', '550e8400-e29b-41d4-a716-446655440000');
      formData.append('title', ''); // Empty title
      formData.append('type', 'lab_result');
      formData.append('record_date', 'invalid-date');

      const result = await createRecordAction(null, formData);

      expect(result.success).toBe(false);
      expect(result.fieldErrors?.title).toBeDefined();
      expect(result.fieldErrors?.record_date).toBeDefined();
    });
  });

  describe('Record Updates & Deletion', () => {
    it('doctor can update record metadata', async () => {
      vi.spyOn(authDal, 'getCurrentUser').mockResolvedValue({
        id: 'doctor-123',
        role: 'doctor',
      } as any);

      vi.spyOn(medicalRecordsDal, 'updateMedicalRecord').mockResolvedValue({
        id: 'rec-1',
        title: 'Updated Blood Count Title',
        patient_id: '550e8400-e29b-41d4-a716-446655440000',
        type: 'lab_result',
        record_date: '2026-08-20',
      } as any);

      const formData = new FormData();
      formData.append('patient_id', '550e8400-e29b-41d4-a716-446655440000');
      formData.append('title', 'Updated Blood Count Title');
      formData.append('type', 'lab_result');
      formData.append('record_date', '2026-08-20');

      const result = await updateRecordAction('rec-1', null, formData);
      expect(result.success).toBe(true);
      expect(result.data?.title).toBe('Updated Blood Count Title');
    });

    it('can delete medical record', async () => {
      vi.spyOn(authDal, 'getCurrentUser').mockResolvedValue({
        id: 'patient-123',
        role: 'patient',
      } as any);

      vi.spyOn(medicalRecordsDal, 'deleteMedicalRecord').mockResolvedValue(undefined);

      const result = await deleteRecordAction('rec-1', '550e8400-e29b-41d4-a716-446655440000');
      expect(result.success).toBe(true);
    });
  });
});
