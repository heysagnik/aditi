import { runAditi, persistAssistantMessage } from "@/lib/agent";
import { getSystemPrompt } from "@/lib/dal";
import { db } from "@/lib/db";
import { messages, conversations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  const body = await request.json();
  const { messages: uiMessages, conversationId: existingId } = body as {
    messages: Array<{ role: string; content: string }>;
    conversationId?: string;
  };

  // Grab the latest customer message
  const lastMsg = uiMessages[uiMessages.length - 1];
  if (!lastMsg || lastMsg.role !== "user") {
    return new Response("Expected a user message", { status: 400 });
  }

  // Resolve or create conversation
  let conversationId = existingId;
  if (!conversationId) {
    conversationId = randomUUID();
    await db.insert(conversations).values({
      id: conversationId,
      customerIdentifier: `guest_${Date.now()}`,
      customerName: (lastMsg.content || "").slice(0, 40) || "Guest",
    });
  }

  // Persist the customer message
  await db.insert(messages).values({
    conversationId,
    role: "user",
    content: lastMsg.content || "",
  });

  // Load system prompt
  const systemPrompt = await getSystemPrompt();

  // Run the agent
  const result = await runAditi({
    systemPrompt,
    conversationId,
    customerMessage: lastMsg.content || "",
  });

  // Convert the stream to a UI Message Stream response.
  // We pipe through onFinish to persist the assistant message.
  return result.toUIMessageStreamResponse({
    sendFinish: true,
    onFinish: async () => {
      // The final text from the assistant
      const text = await result.text;

      await persistAssistantMessage({
        conversationId,
        content: text,
      });
    },
  });
}
