import { requireAdmin } from "@/lib/dal";
import { db } from "@/lib/db";
import { conversations, messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ConversationThread } from "./thread";

export const dynamic = "force-dynamic";

export default async function ConversationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const [conversation] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, id));
  if (!conversation) notFound();

  const history = await db
    .select({
      id: messages.id,
      role: messages.role,
      content: messages.content,
      toolName: messages.toolName,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(messages.createdAt);

  // Map DB rows → useChat UIMessage shape for initial messages.
  const initialMessages = history.map((m) => ({
    id: m.id,
    role: m.role === "user" ? ("user" as const) : ("assistant" as const),
    parts: [
      {
        type: "text" as const,
        text: m.content ?? (m.toolName ? `[tool: ${m.toolName}]` : ""),
      },
    ],
  }));

  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-1 flex-col px-6 py-6">
      <div className="mb-4">
        <Link
          href="/conversations"
          className="text-sm text-zinc-500 hover:underline"
        >
          ← Back to conversations
        </Link>
        <h1 className="mt-2 text-xl font-semibold">
          {conversation.customerName ?? conversation.customerIdentifier}
        </h1>
        <p className="text-sm text-zinc-500">Status: {conversation.status}</p>
      </div>

      <ConversationThread
        conversationId={conversation.id}
        initialMessages={initialMessages}
      />
    </div>
  );
}
