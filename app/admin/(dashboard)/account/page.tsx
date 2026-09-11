import { getCurrentAdmin } from "@/lib/auth";
import ChangePasswordForm from "@/components/admin/ChangePasswordForm";

export default async function AccountPage() {
  const admin = await getCurrentAdmin();
  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-slate-900">My Account</h1>
      <p className="mt-1 text-sm text-slate-500">Manage your login credentials.</p>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <dl className="grid grid-cols-3 gap-y-3 text-sm">
          <dt className="text-slate-500">Email</dt>
          <dd className="col-span-2 font-medium text-slate-900">{admin?.email}</dd>
          <dt className="text-slate-500">Role</dt>
          <dd className="col-span-2 font-medium capitalize text-slate-900">{admin?.role.replace("_", " ")}</dd>
        </dl>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Change password</h2>
        <p className="mt-1 text-sm text-slate-500">Use at least 8 characters.</p>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
