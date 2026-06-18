import { requireAdmin } from "@/lib/dal";
import { db } from "@/lib/db";
import { tickets, user, conversations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, MessageSquare, ExternalLink } from "lucide-react";
import { TicketUpdateForm } from "./ticket-update-form";

export const dynamic = "force-dynamic";

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  open:        { label: "Open",        color: "#3b82f6", dot: "#3b82f6" },
  in_progress: { label: "In Progress", color: "#f59e0b", dot: "#f59e0b" },
  resolved:    { label: "Resolved",    color: "#22c55e", dot: "#22c55e" },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  high:   { label: "High Priority",   color: "#e03131" },
  medium: { label: "Medium Priority", color: "#dd5b00" },
  low:    { label: "Low Priority",    color: "#787671" },
};

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

  const thread = conversation
    ? ((conversation.messages as any[]) || [])
    : [];

  const admins = await db
    .select({ id: user.id, name: user.name })
    .from(user)
    .where(eq(user.role, "admin"));

  const s = statusConfig[ticket.status]     ?? statusConfig.open;
  const p = priorityConfig[ticket.priority] ?? priorityConfig.low;

  return (
    <div className="mx-auto w-full max-w-4xl px-8 py-16">
      <Link
        href="/tickets"
        className="mb-8 flex w-fit items-center gap-2 text-[14px] leading-[1.50] text-[#787671] transition-colors hover:text-[#1a1a1a]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Tickets
      </Link>

      <div className="mb-12">
        <h1 className="text-[36px] font-semibold leading-[1.20] tracking-[-0.5px] text-[#1a1a1a]">
          {ticket.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span
            className="inline-flex items-center gap-1.5 rounded-full border border-[#e5e3df] bg-[#f6f5f4] px-[8px] py-[2px] text-[12px] font-medium leading-[1.40]"
            style={{ color: s.color }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.dot }} />
            {s.label}
          </span>
          <span
            className="rounded-full border border-[#e5e3df] bg-[#f6f5f4] px-[8px] py-[2px] text-[12px] font-medium leading-[1.40]"
            style={{ color: p.color }}
          >
            {p.label}
          </span>
          <span className="flex items-center gap-1.5 text-[13px] text-[#787671]">
            <Clock className="h-3.5 w-3.5" />
            {new Date(ticket.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      {ticket.summary && (
        <div className="mb-8 rounded-[12px] border border-[#e5e3df] bg-[#fef7d6] p-6">
          <p className="mb-2 text-[13px] font-medium uppercase leading-[1.30] tracking-[0.4px] text-[#dd5b00]">
            AI Summary
          </p>
          <p className="text-[16px] leading-[1.50] text-[#37352f]">
            {ticket.summary}
          </p>
        </div>
      )}

      <div className="mb-12">
        <TicketUpdateForm ticket={ticket} admins={admins} />
      </div>

      {conversation && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-[#5645d4]" />
              <p className="text-[18px] font-semibold tracking-[-0.5px] text-[#1a1a1a]">
                Conversation
              </p>
            </div>
            <Link
              href={`/conversations/${conversation.id}`}
              className="flex items-center gap-1.5 rounded-[6px] border border-[#e5e3df] bg-[#ffffff] px-[12px] py-[6px] text-[14px] font-medium text-[#1a1a1a] transition-colors hover:bg-[#fafaf9]"
            >
              Open thread
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="flex max-h-80 flex-col gap-3 overflow-y-auto rounded-[12px] border border-[#e5e3df] bg-[#f6f5f4] p-5">
            {thread.length === 0 ? (
              <p className="text-[14px] text-[#787671]">No messages yet.</p>
            ) : (
              thread.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`px-3.5 py-2.5 text-[14px] leading-[1.50] ${
                      m.role === "user"
                        ? "max-w-[80%] rounded-[12px_12px_4px_12px] bg-[#5645d4] text-white"
                        : "max-w-[80%] rounded-[12px_12px_12px_4px] border border-[#e5e3df] bg-[#ffffff] text-[#1a1a1a]"
                    }`}
                  >
                    {m.content ?? `[tool: ${m.toolName}]`}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
