import { requireAdmin } from "@/lib/dal";
import { db } from "@/lib/db";
import { conversations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ConversationThread } from "./thread";

export const dynamic = "force-dynamic";

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  active:    { label: "Active",    bg: "#d9f3e1", text: "#1aae39" },
  escalated: { label: "Escalated", bg: "#ffe8d4", text: "#793400" },
  resolved:  { label: "Resolved",  bg: "#f0eeec", text: "#5d5b54" },
};

export default async function ConversationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await requireAdmin();
  const { id } = await params;

  const [conversation] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, id));
  if (!conversation) notFound();

  const history = (conversation.messages as any[]) || [];

  const initialMessages = history.map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant" | "admin" | "system",
    content: m.content ?? (m.toolName ? `[tool: ${m.toolName}]` : ""),
  }));

  const status = statusConfig[conversation.status] ?? statusConfig.active;
  const displayName =
    conversation.customerName ?? conversation.customerIdentifier ?? "Unknown";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex h-full flex-col bg-[#ffffff]">
      {/* Top Header */}
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-[#e5e3df] bg-[#ffffff]/95 px-5 backdrop-blur z-10">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[#e6e0f5] text-[13px] font-semibold text-[#391c57]">
          {initials}
        </div>
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <h1 className="truncate text-[15px] font-semibold tracking-[-0.4px] text-[#1a1a1a]">
            {displayName}
          </h1>
          <span
            className="inline-flex items-center rounded-[6px] px-[8px] py-[2px] text-[13px] font-semibold leading-[1.40]"
            style={{ backgroundColor: status.bg, color: status.text }}
          >
            {status.label}
          </span>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <ConversationThread
          conversationId={conversation.id}
          initialMessages={initialMessages}
          aiPaused={conversation.aiPaused}
          adminName={admin.name}
        />
      </div>
    </div>
  );
}
