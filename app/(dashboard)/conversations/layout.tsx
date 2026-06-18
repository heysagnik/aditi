import { requireAdmin } from "@/lib/dal";
import { db } from "@/lib/db";
import { conversations, user } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import ConversationList from "./ConversationList";

import { ClientPoller } from "./ClientPoller";

export const dynamic = "force-dynamic";

export default async function ConversationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  const rows = await db
    .select({
      id:                 conversations.id,
      customerName:       conversations.customerName,
      customerIdentifier: conversations.customerIdentifier,
      status:             conversations.status,
      updatedAt:          conversations.updatedAt,
      assigneeName:       user.name,
    })
    .from(conversations)
    .leftJoin(user, eq(conversations.assignedAdminId, user.id))
    .orderBy(desc(conversations.updatedAt));

  return (
    <div className="flex h-full w-full overflow-hidden">
      <ClientPoller intervalMs={3000} />
      {/* Left Column: List */}
      <div className="flex w-[320px] shrink-0 flex-col border-r border-[#e5e3df] bg-[#ffffff]">
        <div className="flex h-14 shrink-0 items-center border-b border-[#e5e3df] bg-[#ffffff]/95 px-4 backdrop-blur">
          <h1 className="text-[15px] font-semibold tracking-[-0.4px] text-[#1a1a1a]">
            Conversations
          </h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ConversationList rows={rows} />
        </div>
      </div>

      {/* Right Column: Detail / Children */}
      <div className="flex min-w-0 flex-1 flex-col bg-[#ffffff]">
        {children}
      </div>
    </div>
  );
}
