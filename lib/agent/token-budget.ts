import { streamText } from "ai";
import { groq } from "@ai-sdk/groq";

// Use any for flexible message type compatibility with AI SDK
type AnyMessage = {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  [key: string]: unknown;
};

// Token estimation constants (rough approximations for Groq models)
const CHARS_PER_TOKEN = 3.5;
const SYSTEM_PROMPT_TOKEN_BUFFER = 500;
const RESPONSE_TOKEN_BUFFER = 2000;
const MAX_CONTEXT_TOKENS = 128000;
const TARGET_CONTEXT_TOKENS = 96000;

/**
 * Rough token estimation without tiktoken dependency.
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

/**
 * Estimate tokens for a message array.
 */
export function estimateMessageTokens(messages: AnyMessage[]): number {
  let total = 0;
  for (const msg of messages) {
    if (typeof msg.content === "string") {
      total += estimateTokens(msg.content);
    }
    total += 50; // overhead for role, etc.
  }
  return total;
}

/**
 * Create a summarization prompt for the conversation.
 */
function createSummarizationPrompt(messages: AnyMessage[]): string {
  const conversationText = messages
    .map((m) => {
      const role = m.role === "user" ? "Customer" : m.role === "assistant" ? "Aditi" : "System";
      return `${role}: ${typeof m.content === "string" ? m.content : ""}`;
    })
    .join("\n\n");

  return `Summarize the following customer support conversation concisely. 
Focus on: customer issues, actions taken, tools used, outcomes, and any pending items.
Keep it under 500 words. Preserve key details (order IDs, ticket IDs, decisions).

Conversation:
${conversationText}

Summary:`;
}

/**
 * Summarize old messages using a fast, cheap model.
 */
export async function summarizeConversation(messages: AnyMessage[]): Promise<AnyMessage> {
  const summarizationModel = groq(process.env.GROQ_SUMMARIZATION_MODEL ?? "llama-3.1-8b-instant");

  const prompt = createSummarizationPrompt(messages);

  const result = await streamText({
    model: summarizationModel,
    system: "You are a conversation summarizer. Output only the summary.",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.1,
  });

  const summary = await result.text;

  return {
    role: "system",
    content: `[Conversation Summary - ${messages.length} previous messages]\n${summary}`,
  };
}

/**
 * Apply token budget to messages.
 */
export async function applyTokenBudget(
  messages: AnyMessage[],
  systemPrompt: string
): Promise<AnyMessage[]> {
  const systemTokens = estimateTokens(systemPrompt) + SYSTEM_PROMPT_TOKEN_BUFFER;
  const messageTokens = estimateMessageTokens(messages);
  const totalTokens = systemTokens + messageTokens + RESPONSE_TOKEN_BUFFER;

  if (totalTokens <= TARGET_CONTEXT_TOKENS) {
    return messages;
  }

  const RECENT_COUNT = 6;
  const recentMessages = messages.slice(-RECENT_COUNT);
  const oldMessages = messages.slice(0, -RECENT_COUNT);

  if (oldMessages.length === 0) {
    let truncated = [...messages];
    while (estimateMessageTokens(truncated) + systemTokens + RESPONSE_TOKEN_BUFFER > TARGET_CONTEXT_TOKENS && truncated.length > 2) {
      truncated.shift();
    }
    return truncated;
  }

  const summaryMessage = await summarizeConversation(oldMessages);
  return [summaryMessage, ...recentMessages];
}