import { requireAdmin } from "@/lib/dal";
import { db } from "@/lib/db";
import { tickets, user, messages, conversations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { TicketUpdateForm } from "./ticket-update-form";

export const dynamic = "force-dynamic";

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const [ticket] = await db.select().from(tickets).where(eq(tickets.id, id));
  if (!ticket) notFound();

  const [conversation] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, ticket.conversationId));

  const thread =
    conversation ?
      await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, conversation.id))
        .orderBy(messages.createdAt)
    : [];

  const admins = await db
    .select({ id: user.id, name: user.name })
    .from(user)
    .where(eq(user.role, "admin"));

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <div className="mb-4">
        <Link
          href="/tickets"
          className="text-sm text-zinc-500 hover:underline"
        >
          ← Back to tickets
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{ticket.title}</h1>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="default">
              {ticket.status}
            </Badge>
            <Badge variant="secondary">
              {ticket.priority}
            </Badge>
            <span className="text-xs text-zinc-500">
              Created {new Date(ticket.createdAt).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {ticket.summary && (
        <div className="mb-6 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm ">
          <h2 className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500">
            Summary
          </h2>
          <p className="text-zinc-800 ">{ticket.summary}</p>
        </div>
      )}

      <TicketUpdateForm ticket={ticket} admins={admins} />

      {conversation && (
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold">Conversation</h2>
            <Link
              href={`/conversations/${conversation.id}`}
              className="text-sm text-primary hover:underline"
            >
              Open in conversations →
            </Link>
          </div>
          <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 p-4 ">
            {thread.length === 0 ? (
              <p className="text-sm text-zinc-500">No messages yet.</p>
            ) : (
              thread.map((m) => (
                <div key={m.id} className="text-sm">
                  <span className="font-medium capitalize text-zinc-500">
                    {m.role}:
                  </span>{" "}
                  <span className="text-zinc-800 ">
                    {m.content ?? `[tool: ${m.toolName}]`}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
