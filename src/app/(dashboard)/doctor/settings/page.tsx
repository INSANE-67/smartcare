import { requireAuth } from "@/lib/dal/auth";
import { getFullProfile, getDoctorProfile } from "@/lib/dal/profile";
import { getDoctorAvailability } from "@/lib/dal/availability";
import { updateDoctorSettingsAction, changePasswordAction } from "@/lib/actions/settings";
import DoctorAvailabilityForm from "./_components/doctor-availability-form";

export default async function DoctorSettingsPage() {
  const user = await requireAuth();
  if (user.role !== "doctor") return null;

  const [profile, doctor, availability] = await Promise.all([
    getFullProfile(),
    getDoctorProfile(),
    getDoctorAvailability(user.id)
  ]);

  if (!profile || !doctor) return null;

  return (
    <div className="dash-container space-y-8">
      <header className="dash-header mb-0">
        <div>
          <h1 className="dash-title">Settings & Availability</h1>
          <p className="dash-subtitle">Manage your profile, clinic information, availability, and security.</p>
        </div>
      </header>

      {/* Availability Settings */}
      <section className="card p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Availability Schedule</h2>
        <DoctorAvailabilityForm initialAvailability={availability} initialAccepting={doctor.is_accepting_appointments ?? true} />
      </section>

      {/* Professional & Profile Settings */}
      <section className="card p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Professional & Profile Information</h2>
        <form action={updateDoctorSettingsAction as unknown as undefined} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input type="text" name="full_name" defaultValue={profile.full_name} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Specialty</label>
              <input type="text" name="specialty" defaultValue={doctor.specialty} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input type="tel" name="phone" defaultValue={profile.phone || ""} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Appointment Duration (minutes)</label>
              <input type="number" name="appointment_duration" defaultValue={doctor.appointment_duration ?? 30} min={10} max={120} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Clinic Name</label>
              <input type="text" name="clinic_name" defaultValue={doctor.clinic_name || ""} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Clinic Address</label>
              <input type="text" name="clinic_address" defaultValue={doctor.clinic_address || ""} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Bio</label>
              <textarea name="bio" defaultValue={doctor.bio || ""} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
          </div>

          <h3 className="text-md font-medium text-gray-900 mt-6 mb-2">Notification Preferences</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <input type="checkbox" name="email_notifications" value="true" defaultChecked={profile.notification_preferences?.email ?? true} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              <label className="ml-2 block text-sm text-gray-900">Email Notifications</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" name="in_app_notifications" value="true" defaultChecked={profile.notification_preferences?.in_app ?? true} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              <label className="ml-2 block text-sm text-gray-900">In-App Notifications</label>
            </div>
          </div>

          <div className="pt-4">
            <button type="submit" className="btn btn-primary">Save Profile Settings</button>
          </div>
        </form>
      </section>

      {/* Security Settings */}
      <section className="card p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Security</h2>
        <form action={changePasswordAction as unknown as undefined} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700">Current Password</label>
            <input type="password" name="current_password" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <input type="password" name="new_password" required minLength={8} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
            <input type="password" name="confirm_password" required minLength={8} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
          </div>
          <div className="pt-4">
            <button type="submit" className="btn btn-secondary">Update Password</button>
          </div>
        </form>
      </section>
    </div>
  );
}
