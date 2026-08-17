import { describe, it, expect, vi, beforeEach } from 'vitest';
import { bookAppointmentAction } from '@/lib/actions/appointments';
import * as authDal from '@/lib/dal/auth';
import * as appointmentsDal from '@/lib/dal/appointments';
import * as notificationsDal from '@/lib/dal/notifications';

describe('Appointments Server Action - bookAppointmentAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock the dependencies
    vi.spyOn(authDal, 'getCurrentUser').mockResolvedValue({
      id: 'patient-123',
      role: 'patient',
    } as any);

    vi.spyOn(appointmentsDal, 'createAppointment').mockResolvedValue({
      id: 'appt-123',
    } as any);

    vi.spyOn(notificationsDal, 'createNotification').mockResolvedValue(undefined);
  });

  it('should successfully book an appointment and trigger a notification', async () => {
    const formData = new FormData();
    formData.append('doctor_id', '550e8400-e29b-41d4-a716-446655440000'); // Valid UUID
    formData.append('appointment_date', '2027-10-15');
    formData.append('appointment_time', '14:30');
    formData.append('reason', 'Routine checkup');

    const result = await bookAppointmentAction(null, formData);

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ id: 'appt-123' });
    
    // Verify DAL calls
    expect(appointmentsDal.createAppointment).toHaveBeenCalledWith({
      patient_id: 'patient-123',
      doctor_id: '550e8400-e29b-41d4-a716-446655440000',
      appointment_date: '2027-10-15',
      appointment_time: '14:30',
      reason: 'Routine checkup',
      status: 'pending',
      notes: null,
    });

    expect(notificationsDal.createNotification).toHaveBeenCalledWith(expect.objectContaining({
      user_id: '550e8400-e29b-41d4-a716-446655440000',
      type: 'appointment_requested',
      related_entity_id: 'appt-123',
    }));
  });

  it('should return validation errors for invalid input', async () => {
    const formData = new FormData();
    formData.append('doctor_id', 'not-a-uuid'); // Invalid UUID
    formData.append('appointment_date', '10/15/2027'); // Invalid format
    // missing time and reason

    const result = await bookAppointmentAction(null, formData);

    expect(result.success).toBe(false);
    expect(result.fieldErrors).toBeDefined();
    expect(result.fieldErrors?.doctor_id).toBeDefined();
    expect(result.fieldErrors?.appointment_date).toBeDefined();
    expect(result.fieldErrors?.appointment_time).toBeDefined();
    expect(result.fieldErrors?.reason).toBeDefined();
    
    // Should not call DAL methods
    expect(appointmentsDal.createAppointment).not.toHaveBeenCalled();
    expect(notificationsDal.createNotification).not.toHaveBeenCalled();
  });

  it('should fail if user is not a patient', async () => {
    vi.spyOn(authDal, 'getCurrentUser').mockResolvedValue({
      id: 'doctor-123',
      role: 'doctor',
    } as any);

    const formData = new FormData();
    formData.append('doctor_id', '550e8400-e29b-41d4-a716-446655440000');
    formData.append('appointment_date', '2027-10-15');
    formData.append('appointment_time', '14:30');
    formData.append('reason', 'Routine checkup');

    const result = await bookAppointmentAction(null, formData);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Only patients can book appointments');
  });
});
