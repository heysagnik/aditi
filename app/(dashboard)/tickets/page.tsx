import { requireAdmin } from "@/lib/dal";
import { db } from "@/lib/db";
import { tickets, user } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const statusColor: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  open: "default",
  in_progress: "secondary",
  resolved: "outline",
};

const priorityColor: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  high: "destructive",
  medium: "default",
  low: "secondary",
};

export default async function TicketsPage() {
  const admin = await requireAdmin();

  // Tickets assigned to this admin, newest first
  const rows = await db
    .select({
      id: tickets.id,
      title: tickets.title,
      status: tickets.status,
      priority: tickets.priority,
      summary: tickets.summary,
      createdAt: tickets.createdAt,
      assigneeName: user.name,
    })
    .from(tickets)
    .leftJoin(user, eq(tickets.assignedAdminId, user.id))
    .orderBy(desc(tickets.createdAt));

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tickets</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Support tickets created by Aditi or assigned to you.
          </p>
        </div>
        <span className="text-sm text-zinc-500">
          Signed in as <strong>{admin.email}</strong>
        </span>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-12 text-center text-zinc-500 ">
          No tickets yet. They appear here when Aditi escalates a complex issue.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 ">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 ">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Priority</th>
                <th className="px-4 py-3 font-medium">Assignee</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 ">
              {rows.map((t) => (
                <tr
                  key={t.id}
                  className="transition-colors hover:bg-zinc-50 :bg-zinc-900"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/tickets/${t.id}`}
                      className="font-medium text-zinc-900 hover:underline "
                    >
                      {t.title}
                    </Link>
                    {t.summary && (
                      <p className="mt-0.5 max-w-md truncate text-xs text-zinc-500">
                        {t.summary}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusColor[t.status] ?? "default"}>
                      {t.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={priorityColor[t.priority] ?? "default"}>
                      {t.priority}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-zinc-600 ">
                    {t.assigneeName ?? "Unassigned"}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">
                    {new Date(t.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
