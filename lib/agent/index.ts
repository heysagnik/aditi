import { streamText, stepCountIs } from "ai";
import { groq } from "@ai-sdk/groq";
import { getAditiTools } from "./tools";
import { db } from "@/lib/db";
import { conversations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { applyTokenBudget } from "./token-budget";
import { queuedStreamText } from "./groq-client";
import { randomUUID } from "crypto";

// Use any for flexible message type compatibility with AI SDK
type AnyMessage = {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  [key: string]: unknown;
};

/**
 * Run the Aditi agent on a conversation.
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
  // Load message history for context (including tool fields)
  const [conv] = await db
    .select({ messages: conversations.messages })
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1);

  const history = (conv?.messages as any[]) || [];

  // Convert DB messages to AI SDK format with proper tool handling
  const coreMessages: any[] = [];
  let lastToolCallId = "";
  
  for (const m of history) {
    if (m.role === "assistant" && m.toolName) {
      lastToolCallId = m.id;
      coreMessages.push({
        role: "assistant",
        content: [
          ...(m.content ? [{ type: "text", text: m.content }] : []),
          {
            type: "tool-call",
            toolCallId: lastToolCallId,
            toolName: m.toolName,
            args: m.toolArgs ?? {},
          }
        ],
      });
    } else if (m.role === "tool") {
      coreMessages.push({
        role: "tool",
        content: [
          {
            type: "tool-result",
            toolCallId: lastToolCallId || m.id,
            toolName: m.toolName,
            result: m.toolResult,
          }
        ],
      });
    } else {
      coreMessages.push({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content ?? "",
      });
    }
  }

  const budgetedMessages = await applyTokenBudget(coreMessages, systemPrompt);

  budgetedMessages.push({
    role: "user" as const,
    content: customerMessage,
  });

  const model = groq(process.env.GROQ_MODEL ?? "qwen/qwen3.6-27b");

  const result = await queuedStreamText(() =>
    streamText({
      model,
      system: systemPrompt,
      messages: budgetedMessages as any,
      tools: getAditiTools(conversationId),
      stopWhen: stepCountIs(5),
    })
  );

  return result;
}

/**
 * Persist all generated messages (including tool calls and results) after the stream finishes.
 */
export async function persistGeneratedMessages(
  conversationId: string,
  generatedMessages: any[]
) {
  const [conv] = await db
    .select({ messages: conversations.messages })
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1);

  if (!conv) return;

  const currentMessages = (conv.messages as any[]) || [];

  const formattedMessages = generatedMessages.map((m) => {
    // If it's a tool message (tool result)
    if (m.role === "tool") {
      return {
        id: randomUUID(),
        role: "tool", // Preserve the tool role instead of coercing to assistant
        content: null,
        toolName: m.content[0]?.toolName,
        toolArgs: null,
        toolResult: m.content[0]?.output ?? m.content[0]?.result, // Support both output and result
        createdAt: new Date().toISOString(),
      };
    }

    let textContent = null;
    let toolName = null;
    let toolArgs = null;

    if (typeof m.content === "string") {
      textContent = m.content;
      toolName = m.toolCalls?.[0]?.toolName || null;
      toolArgs = m.toolCalls?.[0]?.args || null;
    } else if (Array.isArray(m.content)) {
      const textParts = m.content.filter((p: any) => p.type === "text").map((p: any) => p.text);
      if (textParts.length > 0) textContent = textParts.join("\n");
      
      const toolCallPart = m.content.find((p: any) => p.type === "tool-call");
      if (toolCallPart) {
        toolName = toolCallPart.toolName;
        toolArgs = toolCallPart.args || toolCallPart.input || null;
      }
    }

    return {
      id: randomUUID(),
      role: "assistant",
      content: textContent,
      toolName,
      toolArgs,
      toolResult: null,
      createdAt: new Date().toISOString(),
    };
  });

  await db
    .update(conversations)
    .set({
      messages: [...currentMessages, ...formattedMessages],
    })
    .where(eq(conversations.id, conversationId));
}
