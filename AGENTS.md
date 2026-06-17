<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:aditi-project-spec -->
# Aditi — Project Spec

## Overview

**Aditi** is an AI-powered customer support platform with a live agent named "Aditi".
The platform provides three dashboard pages for admins, plus a public-facing live chat
where end-customers interact with the AI agent. The agent triages issues: easy ones are
resolved automatically via tools; complex ones are escalated into support tickets that
are auto-assigned to the admin with the fewest open tickets.

## Tech Stack

| Layer | Choice | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.9 |
| React | React | 19.2.4 |
| Styling | Tailwind CSS | v4 (CSS-based config, no tailwind.config) |
| UI Components | HeroUI | v3 (React Aria based) |
| Auth | Better Auth | 1.6+ |
| ORM | Drizzle ORM | 0.45+ |
| Database | Neon (serverless Postgres) | — |
| AI Runtime | Vercel AI SDK (`ai`) | v6 |
| AI Provider | `@ai-sdk/google-vertex` (Gemini) | v4 |
| Validation | Zod | v4 |
| Runtime | Node.js (Turbopack default) | 20.9+ |

## Next.js 16 Rules — MUST Follow

1. **Async Request APIs**: `cookies()`, `headers()`, `params`, `searchParams` must ALL be `await`ed. Synchronous access is removed.
2. **No `middleware.ts`**: The `middleware` convention is deprecated in Next.js 16. Auth is handled via DAL-based session checks (`lib/dal.ts`), not a proxy file.
3. **Turbopack**: Default for `next dev` and `next build`. No `--turbopack` flag needed.
4. **`PageProps` / `LayoutProps` / `RouteContext`**: Use `npx next typegen` to generate type-safe helpers for async params/searchParams.
5. **Route Handlers**: Standard `route.ts` with `Request`/`Response` Web APIs. No Pages Router patterns.

## HeroUI v3 Conventions

- `globals.css` imports in this exact order:
  ```css
  @import "tailwindcss";
  @import "@heroui/styles";
  ```
- `<HeroUIProvider>` wraps children in root layout (`app/layout.tsx`).
- `next.config.ts` has `transpilePackages: ["@heroui/react", "@heroui/styles"]`.
- HeroUI v3 component names (React Aria compound components):
  - `Button`, `Input`, `TextArea` (NOT `Textarea`), `Card`/`CardHeader`/`CardContent`/`CardFooter`,
  - `Chip`/`ChipLabel`, `Spinner`, `Tabs`/`TabList`/`Tab`/`TabPanel`,
  - `Avatar`/`AvatarFallback`, `Badge`, `Surface`, `Link`, `Separator`, `Toast`.
  - NO `Navbar`, `Table`, `Modal`, `Select`, `Dropdown` in v3 — use plain HTML + Tailwind.

## File Structure

```
app/
  layout.tsx                          # HeroUIProvider, Geist fonts, globals.css
  globals.css                         # tailwind + heroui styles
  page.tsx                            # redirect → /chat
  (public)/
    layout.tsx                        # minimal public layout (no auth)
    login/
      page.tsx                        # email + password login form
    chat/
      page.tsx                        # public live chat (useChat, streaming)
  (dashboard)/
    layout.tsx                        # auth check + sidebar/nav shell
    knowledge-base/
      page.tsx                        # system prompt editor
    tickets/
      page.tsx                        # CRM: ticket list
      [id]/
        page.tsx                      # ticket detail
    conversations/
      page.tsx                        # conversation list
      [id]/
        page.tsx                      # conversation thread + take-over input
  api/
    auth/[...all]/route.ts            # Better Auth catch-all handler
    chat/route.ts                     # agent streaming endpoint
lib/
  auth.ts                             # Better Auth server instance
  auth-client.ts                      # Better Auth React hooks (client)
  db/
    index.ts                          # drizzle + neon-http client
    schema.ts                         # all table definitions
  dal.ts                              # getCurrentUser, requireAuth, requireAdmin, getSystemPrompt
  agent/
    index.ts                          # runAditi (streamText wrapper)
    prompts.ts                        # default system prompt
    tools.ts                          # refund_lookup + escalate_to_ticket
  utils.ts                            # shared helpers (none yet)
drizzle.config.ts
scripts/seed.ts                       # creates first admin from env vars
```

## Database Schema

Tables managed by Drizzle ORM on Neon PostgreSQL:

| Table | Purpose | Key columns |
|---|---|---|
| `user` | Better Auth users | id, name, email, password, role, emailVerified |
| `session` | Better Auth sessions | id, userId, token, expiresAt |
| `verification` | Better Auth verification | id, identifier, value, expiresAt |
| `settings` | Key-value store | key (unique), value, updatedAt |
| `conversations` | Chat sessions | id, customerIdentifier, status, ticketId, assignedAdminId |
| `messages` | Chat messages | id, conversationId, role, content, toolName, toolArgs, toolResult |
| `tickets` | Support tickets | id, title, status, priority, conversationId (unique), assignedAdminId |

## Agent Loop

1. Customer sends a message at `/chat`.
2. Message is persisted to `messages` table (role=user).
3. `runAditi()` loads conversation history + system prompt, calls `streamText` with Gemini via Vertex.
4. The model either:
   - Calls `refund_lookup` tool → auto-resolves, streams reply.
   - Calls `escalate_to_ticket` tool → creates a ticket (auto-assigns least-busy admin), marks conversation as escalated, streams reply with ticket ID.
   - Responds directly without tools (simple answer).
5. `onFinish` persists the assistant message to `messages`.
6. Response streams back to the client via `useChat`.

## Security Rules

- **All API keys are server-side only.** Never expose `DATABASE_URL`, `BETTER_AUTH_SECRET`, `GOOGLE_VERTEX_API_KEY`, etc. to the client. No `NEXT_PUBLIC_` prefix on secrets.
- **DAL checks everywhere.** Every dashboard page and server action must call `requireAuth()` or `requireAdmin()`. Never rely solely on UI-level gating.
- **No proxy.ts.** Auth enforcement is in the DAL (server-side), not in network middleware.
- **Zod validation** on all server-action inputs and API route bodies.
- **`server-only`** import guard on `lib/dal.ts` and any server-only modules.

## Environment Variables

See `.env.example` for the full list with descriptions. Key variables:
- `DATABASE_URL` — Neon connection string
- `BETTER_AUTH_SECRET` — random 32+ char string
- `BETTER_AUTH_URL` — public base URL
- `GOOGLE_VERTEX_PROJECT`, `GOOGLE_VERTEX_LOCATION`, `GOOGLE_APPLICATION_CREDENTIALS` / `GOOGLE_VERTEX_API_KEY`
- `GEMINI_MODEL` — defaults to `gemini-3.1-pro`
- `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` — for `npm run db:seed`

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start dev server (Turbopack default) |
| `npm run build` | Production build |
| `npm run db:generate` | Generate Drizzle migration SQL |
| `npm run db:migrate` | Run pending migrations |
| `npm run db:push` | Push schema to DB (dev only) |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run db:seed` | Create first admin user |
<!-- END:aditi-project-spec -->
