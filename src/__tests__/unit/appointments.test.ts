/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  bookAppointmentAction,
  cancelAppointmentAction,
  confirmAppointmentAction,
  rejectAppointmentAction,
  completeAppointmentAction,
} from '@/lib/actions/appointments';
import * as authDal from '@/lib/dal/auth';
import * as notificationsDal from '@/lib/dal/notifications';
import * as appointmentsDal from '@/lib/dal/appointments';
import * as serverSupabase from '@/lib/supabase/server';

describe('Appointments End-to-End Workflow & Actions', () => {
  let mockSupabase: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'patient-123' } }, error: null }),
      },
      from: vi.fn((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: { id: '550e8400-e29b-41d4-a716-446655440000', role: 'doctor' } }),
              }),
            }),
          };
        }
        if (table === 'appointments') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    not: vi.fn().mockResolvedValue({ data: [] }), // No double booking
                  }),
                }),
              }),
            }),
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    id: 'appt-123',
                    patient_id: 'patient-123',
                    doctor_id: '550e8400-e29b-41d4-a716-446655440000',
                    appointment_date: '2027-10-15',
                    appointment_time: '14:30:00',
                    status: 'pending',
                  },
                  error: null,
                }),
              }),
            }),
          };
        }
        return {};
      }),
    };

    vi.spyOn(serverSupabase, 'createSupabaseServerClient').mockResolvedValue(mockSupabase as any);
    vi.spyOn(notificationsDal, 'createNotification').mockResolvedValue(undefined);
  });

  describe('Booking & Validation', () => {
    it('should successfully book an appointment and trigger a notification', async () => {
      vi.spyOn(authDal, 'getCurrentUser').mockResolvedValue({
        id: 'patient-123',
        role: 'patient',
      } as any);

      const formData = new FormData();
      formData.append('doctor_id', '550e8400-e29b-41d4-a716-446655440000');
      formData.append('appointment_date', '2027-10-15');
      formData.append('appointment_time', '14:30');
      formData.append('reason', 'Routine checkup');

      const result = await bookAppointmentAction(null, formData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toMatchObject({ id: 'appt-123' });
      }
      
      expect(notificationsDal.createNotification).toHaveBeenCalledWith(expect.objectContaining({
        user_id: '550e8400-e29b-41d4-a716-446655440000',
        type: 'appointment_requested',
        related_entity_id: 'appt-123',
      }));
    });

    it('should prevent past appointment bookings', async () => {
      vi.spyOn(authDal, 'getCurrentUser').mockResolvedValue({
        id: 'patient-123',
        role: 'patient',
      } as any);

      const formData = new FormData();
      formData.append('doctor_id', '550e8400-e29b-41d4-a716-446655440000');
      formData.append('appointment_date', '2020-01-01'); // Past date
      formData.append('appointment_time', '14:30');
      formData.append('reason', 'Past visit');

      const result = await bookAppointmentAction(null, formData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Cannot book appointments in the past');
      }
    });

    it('should return validation errors for invalid fields', async () => {
      vi.spyOn(authDal, 'getCurrentUser').mockResolvedValue({
        id: 'patient-123',
        role: 'patient',
      } as any);

      const formData = new FormData();
      formData.append('doctor_id', 'not-a-uuid');
      formData.append('appointment_date', '10/15/2027');

      const result = await bookAppointmentAction(null, formData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.fieldErrors).toBeDefined();
      }
    });
  });

  describe('Lifecycle Status Transitions', () => {
    it('patient should cancel pending appointment', async () => {
      vi.spyOn(authDal, 'getCurrentUser').mockResolvedValue({
        id: 'patient-123',
        role: 'patient',
      } as any);

      vi.spyOn(appointmentsDal, 'getAppointmentById').mockResolvedValue({
        id: 'appt-123',
        patient_id: 'patient-123',
        doctor_id: 'doctor-123',
        status: 'pending',
        appointment_date: '2027-10-15',
        appointment_time: '14:30:00',
      } as any);

      vi.spyOn(appointmentsDal, 'updateAppointment').mockResolvedValue({
        id: 'appt-123',
        status: 'cancelled',
        doctor_id: 'doctor-123',
      } as any);

      const res = await cancelAppointmentAction('appt-123');
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data?.status).toBe('cancelled');
      }
    });

    it('doctor should confirm pending appointment', async () => {
      vi.spyOn(authDal, 'getCurrentUser').mockResolvedValue({
        id: 'doctor-123',
        role: 'doctor',
      } as any);

      vi.spyOn(appointmentsDal, 'getAppointmentById').mockResolvedValue({
        id: 'appt-123',
        doctor_id: 'doctor-123',
        patient_id: 'patient-123',
        status: 'pending',
      } as any);

      vi.spyOn(appointmentsDal, 'updateAppointment').mockResolvedValue({
        id: 'appt-123',
        status: 'confirmed',
        patient_id: 'patient-123',
      } as any);

      const res = await confirmAppointmentAction('appt-123');
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data?.status).toBe('confirmed');
      }
    });

    it('doctor should reject pending appointment', async () => {
      vi.spyOn(authDal, 'getCurrentUser').mockResolvedValue({
        id: 'doctor-123',
        role: 'doctor',
      } as any);

      vi.spyOn(appointmentsDal, 'getAppointmentById').mockResolvedValue({
        id: 'appt-123',
        doctor_id: 'doctor-123',
        patient_id: 'patient-123',
        status: 'pending',
      } as any);

      vi.spyOn(appointmentsDal, 'updateAppointment').mockResolvedValue({
        id: 'appt-123',
        status: 'rejected',
        patient_id: 'patient-123',
      } as any);

      const res = await rejectAppointmentAction('appt-123');
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data?.status).toBe('rejected');
      }
    });

    it('doctor should complete confirmed appointment with notes', async () => {
      vi.spyOn(authDal, 'getCurrentUser').mockResolvedValue({
        id: 'doctor-123',
        role: 'doctor',
      } as any);

      vi.spyOn(appointmentsDal, 'getAppointmentById').mockResolvedValue({
        id: 'appt-123',
        doctor_id: 'doctor-123',
        patient_id: 'patient-123',
        status: 'confirmed',
      } as any);

      vi.spyOn(appointmentsDal, 'updateAppointment').mockResolvedValue({
        id: 'appt-123',
        status: 'completed',
        notes: 'Patient diagnosed with seasonal rhinitis. Prescribed antihistamines.',
      } as any);

      const formData = new FormData();
      formData.append('notes', 'Patient diagnosed with seasonal rhinitis. Prescribed antihistamines.');

      const res = await completeAppointmentAction('appt-123', null, formData);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data?.status).toBe('completed');
      }
    });

    it('should prevent completing an appointment that is already cancelled', async () => {
      vi.spyOn(authDal, 'getCurrentUser').mockResolvedValue({
        id: 'doctor-123',
        role: 'doctor',
      } as any);

      vi.spyOn(appointmentsDal, 'getAppointmentById').mockResolvedValue({
        id: 'appt-123',
        doctor_id: 'doctor-123',
        patient_id: 'patient-123',
        status: 'cancelled',
      } as any);

      const formData = new FormData();
      formData.append('notes', 'Some notes');

      const res = await completeAppointmentAction('appt-123', null, formData);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error).toContain('Only confirmed appointments can be completed');
      }
    });
  });
});
