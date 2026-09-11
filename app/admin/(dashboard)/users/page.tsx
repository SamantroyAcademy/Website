import { getCurrentAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import CreateAdminForm from "@/components/admin/CreateAdminForm";
import UserActions from "@/components/admin/UserActions";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const admin = await getCurrentAdmin();

  if (admin?.role !== "super_admin") {
    return (
      <div className="max-w-xl">
        <h1 className="text-2xl font-bold text-slate-900">Users</h1>
        <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Only the Super Admin can manage admin accounts.
        </p>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: admins } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .order("created_at", { ascending: true });

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900">Admin Users</h1>
      <p className="mt-1 text-sm text-slate-500">Create new admins and see who has access.</p>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(admins ?? []).map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-3 font-medium text-slate-900">{a.full_name || "—"}</td>
                <td className="px-4 py-3 text-slate-600">{a.email}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${a.role === "super_admin" ? "bg-brand-100 text-brand-700" : a.role === "pending" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                    {a.role.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <UserActions id={a.id} role={a.role as "pending" | "admin" | "super_admin"} isSelf={a.id === admin.id} />
                </td>
              </tr>
            ))}
            {(!admins || admins.length === 0) && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">No admins yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Add a new admin</h2>
        <p className="mt-1 text-sm text-slate-500">They can change their own password after first sign-in.</p>
        <CreateAdminForm />
      </div>
    </div>
  );
}
