import { requireAdmin } from "@/lib/dal";
import { Sidebar } from "./sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // DAL check — redirects to /login if not an admin.
  const admin = await requireAdmin();

  return (
    <div className="flex h-screen w-full bg-zinc-50/30 overflow-hidden">
      {/* Sidebar */}
      <Sidebar admin={admin} />

      {/* Main content */}
      <main className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden relative">
        {children}
      </main>
    </div>
  );
}
