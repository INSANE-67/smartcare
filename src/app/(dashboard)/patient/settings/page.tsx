import { requireAuth } from "@/lib/dal/auth";
import { getFullProfile } from "@/lib/dal/profile";
import { updatePatientSettingsAction, changePasswordAction } from "@/lib/actions/settings";

export default async function PatientSettingsPage() {
  await requireAuth();
  const profile = await getFullProfile();

  if (!profile) return null;

  return (
    <div className="dash-container">
      <header className="dash-header">
        <div>
          <h1 className="dash-title">Settings</h1>
          <p className="dash-subtitle">Manage your profile, preferences, and security.</p>
        </div>
      </header>

      <div className="space-y-6">
        {/* Profile Settings */}
        <section className="card p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h2>
          <form action={updatePatientSettingsAction as unknown as undefined} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" name="full_name" defaultValue={profile.full_name} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input type="tel" name="phone" defaultValue={profile.phone || ""} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                <input type="date" name="date_of_birth" defaultValue={profile.date_of_birth || ""} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Gender</label>
                <select name="gender" defaultValue={profile.gender || ""} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
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
              <button type="submit" className="btn btn-primary">Save Changes</button>
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
    </div>
  );
}
