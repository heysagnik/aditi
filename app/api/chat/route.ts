import { runAditi, persistGeneratedMessages } from "@/lib/agent";
import { getSystemPrompt } from "@/lib/dal";
import { db } from "@/lib/db";
import { conversations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  const body = await request.json();
  const headerId = request.headers.get("x-conversation-id");
  const { messages: uiMessages, conversationId: existingId } = body as {
    messages: Array<any>;
    conversationId?: string;
  };

  const customerName = request.headers.get("x-customer-name") || "Guest";
  const customerIdentifier = request.headers.get("x-customer-identifier") || `guest_${Date.now()}`;

  // Grab the latest customer message
  const lastMsg = uiMessages[uiMessages.length - 1];
  if (!lastMsg || lastMsg.role !== "user") {
    return new Response("Expected a user message", { status: 400 });
  }

  let userText = lastMsg.content || "";
  if (!userText && lastMsg.parts) {
    const textPart = lastMsg.parts.find((p: any) => p.type === "text");
    if (textPart) {
      userText = textPart.text || "";
    }
  }

  // Resolve or create conversation
  let conversationId = existingId || headerId;
  let conv = null;

  if (conversationId) {
    const existing = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);

    if (existing.length === 0) {
      const [inserted] = await db.insert(conversations).values({
        id: conversationId,
        customerIdentifier,
        customerName,
        messages: [],
      }).returning();
      conv = inserted;
    } else {
      conv = existing[0];
    }
  } else {
    conversationId = randomUUID();
    const [inserted] = await db.insert(conversations).values({
      id: conversationId,
      customerIdentifier,
      customerName,
      messages: [],
    }).returning();
    conv = inserted;
  }

  // Persist the customer message
  const currentMessages = (conv.messages as any[]) || [];
  const updatedMessages = [
    ...currentMessages,
    {
      id: randomUUID(),
      role: "user",
      content: userText,
      createdAt: new Date().toISOString(),
    },
  ];

  await db
    .update(conversations)
    .set({ messages: updatedMessages })
    .where(eq(conversations.id, conversationId));

  // If AI is paused, return an empty stream to avoid triggering agent loop
  if (conv.aiPaused) {
    const stream = new ReadableStream({
      start(controller) {
        controller.close();
      },
    });
    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  // Load system prompt
  const systemPrompt = await getSystemPrompt();
  const fullSystemPrompt = `${systemPrompt}\n\n[System Info]\nYou are currently speaking with:\n- Name: ${conv.customerName || "Unknown"}\n- Identifier (Email/Phone): ${conv.customerIdentifier || "Unknown"}\n- Conversation ID: ${conversationId}\n\nAlways use this context to greet them and look up their details. You MUST use this Conversation ID when calling the escalate_to_ticket tool.`;

  // Format existing conversation history for the AI
  const historyMsgs = updatedMessages.map((m: any) => ({
    role: m.role as "user" | "assistant" | "system",
    content: m.content || "",
  }));

  // Call the agent wrapper
  const result = await runAditi({
    systemPrompt: fullSystemPrompt,
    conversationId,
    customerMessage: userText,
  });

  // Convert the stream to a UI Message Stream response.
  return (result as any).toUIMessageStreamResponse({
    sendFinish: true,
    onFinish: async () => {
      try {
        const response = await (result as any).response;
        if (response && response.messages) {
          await persistGeneratedMessages(conversationId, response.messages);
        } else {
          // Fallback if response.messages is not available
          const text = await (result as any).text;
          await persistGeneratedMessages(conversationId, [
            { role: "assistant", content: text }
          ]);
        }
      } catch (err) {
        console.error("Error persisting generated messages:", err);
      }
    },
  });
}
