import { requireAdmin } from "@/lib/dal";
import { Sidebar } from "./sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <div
      className="flex h-screen w-full overflow-hidden"
      style={{ background: "var(--canvas)" }}
    >
      <Sidebar admin={admin} />
      <main className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
