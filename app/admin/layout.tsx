import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Admin | Samantroy Academy CMS" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-root min-h-screen font-sans antialiased">{children}</div>;
}
