"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Action = "make_admin" | "make_super_admin" | "remove";

export default function UserActions({
  id,
  role,
  isSelf,
}: {
  id: string;
  role: "pending" | "admin" | "super_admin";
  isSelf: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  if (isSelf) return <span className="text-xs text-slate-400">You</span>;

  async function run(action: Action, confirmMsg?: string) {
    if (confirmMsg && !confirm(confirmMsg)) return;
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/admin/manage-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Action failed.");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Action failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      {role !== "super_admin" && (
        <button
          onClick={() => run("make_super_admin", "Promote this user to Super Admin? They will be able to manage other admins.")}
          disabled={busy}
          className="rounded border border-brand-200 px-2 py-0.5 text-xs font-medium text-brand-700 hover:bg-brand-50 disabled:opacity-50"
        >
          Make super
        </button>
      )}
      {role === "super_admin" && (
        <button
          onClick={() => run("make_admin", "Demote this Super Admin to a regular admin?")}
          disabled={busy}
          className="rounded border border-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          Make admin
        </button>
      )}
      {role === "pending" && (
        <button
          onClick={() => run("make_admin")}
          disabled={busy}
          className="rounded border border-green-200 px-2 py-0.5 text-xs font-medium text-green-700 hover:bg-green-50 disabled:opacity-50"
        >
          Approve as admin
        </button>
      )}
      <button
        onClick={() => run("remove", "Remove this user's access permanently? This deletes their login.")}
        disabled={busy}
        className="rounded border border-red-200 px-2 py-0.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        Remove
      </button>
      {err && <span className="w-full text-right text-[11px] text-red-600">{err}</span>}
    </div>
  );
}
