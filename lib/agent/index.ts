import { streamText, stepCountIs } from "ai";
import { vertex } from "@ai-sdk/google-vertex";
import { aditiTools } from "./tools";
import { db } from "@/lib/db";
import { messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Run the Aditi agent on a conversation.
 *
 * 1. Loads conversation history from the messages table.
 * 2. Calls streamText with the system prompt, history, and tools.
 * 3. Returns the stream result — callers pipe it to a Response.
 *
 * `onFinish` is provided so the caller can persist the assistant's
 * final message and any tool calls after streaming completes.
 */
export async function runAditi({
  systemPrompt,
  conversationId,
  customerMessage,
}: {
  systemPrompt: string;
  conversationId: string;
  customerMessage: string;
}) {
  // Load message history for context
  const history = await db
    .select({
      role: messages.role,
      content: messages.content,
    })
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.createdAt);

  // Map DB role → AI SDK role
  const coreMessages = history.map((m) => ({
    role: m.role === "user" ? ("user" as const) : ("assistant" as const),
    content: m.content ?? "",
  }));

  // Append the new customer message
  coreMessages.push({
    role: "user" as const,
    content: customerMessage,
  });

  const model = vertex(process.env.GEMINI_MODEL ?? "gemini-3.1-pro");

  const result = streamText({
    model,
    system: systemPrompt,
    messages: coreMessages,
    tools: aditiTools,
    stopWhen: stepCountIs(5),
  });

  return result;
}

/**
 * Persist an assistant or tool message after the stream finishes.
 */
export async function persistAssistantMessage({
  conversationId,
  content,
  toolName,
  toolArgs,
  toolResult,
}: {
  conversationId: string;
  content?: string;
  toolName?: string;
  toolArgs?: unknown;
  toolResult?: unknown;
}) {
  await db.insert(messages).values({
    conversationId,
    role: "assistant",
    content: content ?? null,
    toolName: toolName ?? null,
    toolArgs: toolArgs ? JSON.parse(JSON.stringify(toolArgs)) : null,
    toolResult: toolResult ? JSON.parse(JSON.stringify(toolResult)) : null,
  });
}
