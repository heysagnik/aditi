import { requireAdmin } from "@/lib/dal";
import { db } from "@/lib/db";
import { conversations, messages, user } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const statusColor: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  escalated: "destructive",
  resolved: "secondary",
};

export default async function ConversationsPage() {
  await requireAdmin();

  const rows = await db
    .select({
      id: conversations.id,
      customerName: conversations.customerName,
      customerIdentifier: conversations.customerIdentifier,
      status: conversations.status,
      updatedAt: conversations.updatedAt,
      assigneeName: user.name,
    })
    .from(conversations)
    .leftJoin(user, eq(conversations.assignedAdminId, user.id))
    .orderBy(desc(conversations.updatedAt));

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Conversations</h1>
        <p className="mt-1 text-sm text-zinc-500">
          All customer chat sessions. Click any to view the full thread and
          take over.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-12 text-center text-zinc-500 ">
          No conversations yet. Visit{" "}
          <Link href="/chat" className="text-primary hover:underline">
            /chat
          </Link>{" "}
          to start one as a customer.
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 ">
          {rows.map((c) => (
            <Link
              key={c.id}
              href={`/conversations/${c.id}`}
              className="flex items-center justify-between gap-4 bg-white px-4 py-4 transition-colors hover:bg-zinc-50 :bg-zinc-900"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {c.customerName ?? c.customerIdentifier}
                </p>
                <p className="truncate text-xs text-zinc-500">
                  Last updated {new Date(c.updatedAt).toLocaleString()}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {c.assigneeName && (
                  <span className="text-xs text-zinc-500">
                    {c.assigneeName}
                  </span>
                )}
                <Badge variant={statusColor[c.status] ?? "default"}>
                  {c.status}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
