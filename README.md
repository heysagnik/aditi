# Aditi - AI Customer Support Agent

Aditi is an AI-powered customer support platform that provides automated triage and issue resolution. It interacts with customers through a live chat interface and can automatically resolve simple issues or escalate complex ones to human admins.

## Agent Infrastructure & Workflow

The core agent is built using the **Vercel AI SDK** and operates entirely within a serverless flow.

1. **Client Interaction (`app/(public)/chat/page.tsx`)**
   - The user interface is built with React and `@ai-sdk/react`. 
   - A unique `conversationId` is generated per session to maintain state.
   - Messages are sent via a streaming transport (`DefaultChatTransport`) to the `/api/chat` endpoint.

2. **Server Route (`app/api/chat/route.ts`)**
   - Receives the incoming message and the `conversationId`.
   - Validates the session. If it's a new `conversationId`, it creates a new entry in the `conversations` table.
   - Persists the incoming user message to the `messages` database table.
   - Fetches the dynamic system prompt (editable by admins in the dashboard).
   - Invokes the core agent wrapper (`runAditi`).

3. **Agent Runtime (`lib/agent/index.ts`)**
   - Retrieves the full conversation history from the `messages` table. This history includes user messages, assistant replies, and strict records of tool invocations (`toolName`, `toolArgs`, `toolResult`).
   - Converts the database records into the standard AI SDK message format.
   - Applies a token budget to ensure the context window remains within limits.
   - Streams the response back to the client using `streamText`, powered by a Groq LLM model (Llama-3.3-70b-versatile).
   - Once the stream completes, an `onFinish` callback triggers to persist the assistant's reply (and any tool calls) to the database.

## Escalation Mechanism

Aditi is equipped with custom tools (defined in `lib/agent/tools.ts`) that allow it to interact with the broader system. When the AI determines that a customer's issue is too complex or requires manual review, it triggers the `escalate_to_ticket` tool.

1. **Auto-Assignment:** The tool queries the database using Drizzle ORM to find the admin who currently has the **fewest open tickets**.
2. **Ticket Creation:** It inserts a new record into the `tickets` table, assigning the ticket to the least-busy admin and logging the priority and summary.
3. **State Change:** The existing `conversation` record is updated. Its status changes from `active` to `escalated`, and it is formally linked to the newly created `ticketId`.
4. **Resolution:** The AI streams a confirmation back to the customer, providing them with the ticket ID and notifying them that a human agent will follow up.

## Data Storage

The application uses **Neon (Serverless Postgres)** and **Drizzle ORM** for its data layer.

- **`conversations`:** Manages the high-level chat session. Tracks status (`active`, `escalated`, `resolved`) and the assigned ticket/admin if escalated.
- **`messages`:** Stores the chronological history of the chat. It is linked to a conversation via a cascading foreign key. This table ensures the AI remembers context by storing raw text as well as structured JSONB columns for tool interactions (`toolName`, `toolArgs`, `toolResult`).
- **`tickets`:** Represents escalated support issues. Links back to the `conversationId` and tracks resolution status, priority, and admin assignment.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
