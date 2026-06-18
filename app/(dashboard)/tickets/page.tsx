import { requireAdmin } from "@/lib/dal";
import { db } from "@/lib/db";
import { tickets, user } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { ArrowUpRight, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  open:        { label: "Open",        color: "#3b82f6", dot: "#3b82f6" },
  in_progress: { label: "In Progress", color: "#f59e0b", dot: "#f59e0b" },
  resolved:    { label: "Resolved",    color: "#22c55e", dot: "#22c55e"  },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  high:   { label: "High",   color: "#e03131" },
  medium: { label: "Medium", color: "#dd5b00" },
  low:    { label: "Low",    color: "#787671" },
};

export default async function TicketsPage() {
  const admin = await requireAdmin();

  const rows = await db
    .select({
      id:           tickets.id,
      title:        tickets.title,
      status:       tickets.status,
      priority:     tickets.priority,
      summary:      tickets.summary,
      createdAt:    tickets.createdAt,
      assigneeName: user.name,
    })
    .from(tickets)
    .leftJoin(user, eq(tickets.assignedAdminId, user.id))
    .orderBy(desc(tickets.createdAt));

  const openCount       = rows.filter((r) => r.status === "open").length;
  const inProgressCount = rows.filter((r) => r.status === "in_progress").length;
  const resolvedCount   = rows.filter((r) => r.status === "resolved").length;

  return (
    <div className="mx-auto w-full max-w-6xl px-8 py-16">
      <div className="mb-12 flex items-start justify-between">
        <div>
          <h1 className="text-[36px] font-semibold leading-[1.20] tracking-[-0.5px] text-[#1a1a1a]">
            Tickets
          </h1>
          <p className="mt-2 text-[16px] leading-[1.55] text-[#787671]">
            AI-escalated support tickets
          </p>
        </div>
        <p className="text-[14px] text-[#787671]">{admin.email}</p>
      </div>

      {rows.length > 0 && (
        <div className="mb-8 grid grid-cols-3 gap-6">
          {[
            { label: "Open",        count: openCount,       color: "#3b82f6" },
            { label: "In Progress", count: inProgressCount, color: "#f59e0b" },
            { label: "Resolved",    count: resolvedCount,   color: "#22c55e" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-[12px] border border-[#e5e3df] bg-[#f6f5f4] p-6"
            >
              <p
                className="text-[36px] font-semibold leading-[1.20] tracking-[-0.5px]"
                style={{ color: s.color }}
              >
                {s.count}
              </p>
              <p className="mt-2 text-[14px] leading-[1.50] text-[#787671]">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      )}

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-[12px] border border-dashed border-[#c8c4be] bg-[#f6f5f4] py-20 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-[8px] border border-[#e5e3df] bg-[#ffffff]">
            <AlertCircle className="h-5 w-5 text-[#5645d4]" />
          </div>
          <div>
            <p className="text-[16px] font-medium text-[#1a1a1a]">
              No tickets yet
            </p>
            <p className="mt-1 text-[14px] leading-[1.50] text-[#787671]">
              Tickets appear here when Aditi escalates a complex issue.
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[12px] border border-[#e5e3df] bg-[#ffffff]">
          <table className="w-full text-left">
            <thead className="border-b border-[#e5e3df] bg-[#fafaf9]">
              <tr>
                {["Title", "Status", "Priority", "Assignee", "Created", ""].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-4 text-[12px] font-medium uppercase tracking-[0.4px] text-[#787671]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e3df]">
              {rows.map((t) => {
                const s = statusConfig[t.status]     ?? statusConfig.open;
                const p = priorityConfig[t.priority] ?? priorityConfig.low;
                return (
                  <tr
                    key={t.id}
                    className="group transition-colors hover:bg-[#fafaf9]"
                  >
                    <td className="px-6 py-4">
                      <Link href={`/tickets/${t.id}`} className="flex flex-col gap-1">
                        <span className="text-[14px] text-[#1a1a1a] transition-colors hover:text-[#5645d4]">
                          {t.title}
                        </span>
                        {t.summary && (
                          <span className="max-w-[400px] truncate text-[13px] text-[#787671]">
                            {t.summary}
                          </span>
                        )}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#e5e3df] bg-[#f6f5f4] px-[8px] py-[2px] text-[12px] font-medium leading-[1.40]"
                        style={{ color: s.color }}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: s.dot }}
                        />
                        {s.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="rounded-full border border-[#e5e3df] bg-[#f6f5f4] px-[8px] py-[2px] text-[12px] font-medium leading-[1.40]"
                        style={{ color: p.color }}
                      >
                        {p.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[14px] text-[#787671]">
                        {t.assigneeName ?? "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[13px] text-[#787671]">
                        {new Date(t.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/tickets/${t.id}`}
                        className="inline-flex items-center justify-center rounded-[6px] border border-[#e5e3df] bg-[#ffffff] p-2 text-[#787671] opacity-0 transition-all hover:bg-[#f6f5f4] hover:text-[#1a1a1a] group-hover:opacity-100"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
