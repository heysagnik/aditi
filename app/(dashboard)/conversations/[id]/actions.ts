"use server";

import { db } from "@/lib/db";
import { conversations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

export async function adminReply(conversationId: string, text: string) {
  const [conv] = await db
    .select({ messages: conversations.messages })
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1);

  if (!conv) {
    throw new Error("Conversation not found");
  }

  const currentMessages = (conv.messages as any[]) || [];

  await db
    .update(conversations)
    .set({
      aiPaused: true,
      messages: [
        ...currentMessages,
        {
          id: randomUUID(),
          role: "admin",
          content: text,
          createdAt: new Date().toISOString(),
        },
      ],
    })
    .where(eq(conversations.id, conversationId));

  revalidatePath(`/conversations/${conversationId}`);
}

export async function takeOverConversation(conversationId: string, adminName: string) {
  const [conv] = await db
    .select({ messages: conversations.messages, aiPaused: conversations.aiPaused })
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1);

  if (!conv) {
    throw new Error("Conversation not found");
  }

  if (conv.aiPaused) {
    return; // Already paused
  }

  const currentMessages = (conv.messages as any[]) || [];

  await db
    .update(conversations)
    .set({
      aiPaused: true,
      messages: [
        ...currentMessages,
        {
          id: randomUUID(),
          role: "system",
          content: `${adminName} joined the conversation`,
          createdAt: new Date().toISOString(),
        },
      ],
    })
    .where(eq(conversations.id, conversationId));

  revalidatePath(`/conversations/${conversationId}`);
}
