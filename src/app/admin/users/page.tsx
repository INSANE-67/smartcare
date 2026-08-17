import { getAllUsers } from "@/lib/dal/admin";
import Image from "next/image";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q || "";
  const users = await getAllUsers(query);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">All Users</h1>
        <p className="text-slate-500 mt-1">Manage and view registered platform users.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <form className="flex w-full max-w-sm">
            <input 
              type="search" 
              name="q"
              defaultValue={query}
              placeholder="Search by name..." 
              className="flex-1 rounded-l-md border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
            <button type="submit" className="bg-slate-800 text-white px-4 py-2 rounded-r-md hover:bg-slate-900">
              Search
            </button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm uppercase text-slate-500">
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      {user.avatar_url ? (
                        <Image src={user.avatar_url} alt={user.full_name} width={40} height={40} className="w-10 h-10 rounded-full object-cover border border-slate-200" unoptimized />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
                          {user.full_name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-slate-900">{user.full_name}</div>
                        <div className="text-sm text-slate-500">{user.id.split('-')[0]}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                      user.role === 'doctor' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.is_active ? (
                      <span className="text-teal-600 font-medium text-sm flex items-center">
                        <span className="w-2 h-2 rounded-full bg-teal-500 mr-2"></span> Active
                      </span>
                    ) : (
                      <span className="text-red-600 font-medium text-sm flex items-center">
                        <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span> Suspended
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(user.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    No users found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
