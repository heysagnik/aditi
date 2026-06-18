import { MessageSquare } from "lucide-react";

export default function ConversationsPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-[12px] border border-[#e5e3df] bg-[#ffffff] shadow-sm">
        <MessageSquare className="h-6 w-6 text-[#a4a097]" />
      </div>
      <h2 className="mt-4 text-[18px] font-medium leading-[1.25] text-[#1a1a1a]">
        No conversation selected
      </h2>
      <p className="mt-1 max-w-[280px] text-[14px] leading-[1.50] text-[#787671]">
        Select a conversation from the sidebar to view the thread and respond.
      </p>
    </div>
  );
}
