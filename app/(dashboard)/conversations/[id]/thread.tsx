"use client";

import { isToolUIPart, getToolName } from "ai";
import { useEffect, useRef, useState, useTransition } from "react";
import { Send, Loader2, User, ShieldAlert, AlertCircle } from "lucide-react";
import { Logo } from "@/components/logo";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { adminReply, takeOverConversation } from "./actions";

export function ConversationThread({
  conversationId,
  initialMessages,
  aiPaused,
  adminName,
}: {
  conversationId: string;
  initialMessages: Array<{ id: string; role: "user" | "assistant" | "admin" | "system"; content: string; parts?: any[] }>;
  aiPaused: boolean;
  adminName: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isPending) return;
    
    const text = input;
    setInput("");
    
    startTransition(async () => {
      await adminReply(conversationId, text);
    });
  };

  const handleTakeOver = () => {
    if (isPending) return;
    startTransition(async () => {
      await takeOverConversation(conversationId, adminName);
    });
  };

  const prevMessagesLengthRef = useRef(initialMessages.length);

  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current;
      // We consider it "at bottom" if we are within 150px of the bottom
      const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
      
      if (initialMessages.length > prevMessagesLengthRef.current || isAtBottom) {
        el.scrollTop = el.scrollHeight;
      }
    }
    prevMessagesLengthRef.current = initialMessages.length;
  }, [initialMessages]);

  return (
    <div className="flex h-full w-full flex-col bg-[#ffffff]">
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-[5%] lg:px-[10%] py-6">
        {initialMessages.map((m) => {
          if (m.role === "system") {
            return (
              <div key={m.id} className="flex justify-center my-4">
                <div className="flex items-center gap-2 rounded-full bg-[#f6f5f4] px-4 py-1.5 text-[12px] font-medium text-[#787671]">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  <span>{m.content}</span>
                </div>
              </div>
            );
          }

          const isOwnMessage = m.role === "admin";
          const isAI = m.role === "assistant";

          return (
            <div
              key={m.id}
              className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex max-w-[78%] gap-3 ${
                  isOwnMessage ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] border border-[#e5e3df] ${
                    isAI ? "bg-[#ffffff]" : isOwnMessage ? "bg-[#5645d4]" : "bg-[#f6f5f4]"
                  }`}
                >
                  {isAI ? (
                    <Logo className="h-5 w-5 text-[#1a1a1a]" />
                  ) : isOwnMessage ? (
                    <ShieldAlert className="h-4 w-4 text-white" />
                  ) : (
                    <User className="h-4 w-4 text-[#787671]" />
                  )}
                </div>

                <div className={`flex flex-col gap-2 max-w-[85%] ${isOwnMessage ? "items-end" : "items-start"}`}>
                  {(() => {
                    const c = (m as any).content || (m as any).text;
                    let safeContent = "";
                    if (typeof c === "string") safeContent = c;
                    else if (Array.isArray(c)) {
                      safeContent = c.filter((p: any) => p.type === "text").map((p: any) => p.text).join("\n");
                    }

                    const parts: any[] = [];
                    if (safeContent) {
                      parts.push({ type: "text", text: safeContent });
                    }

                    if ((m as any).toolName) {
                      parts.push({
                        type: "tool-invocation",
                        toolInvocationId: m.id,
                        toolName: (m as any).toolName,
                        args: (m as any).toolArgs,
                        result: (m as any).toolResult,
                        state: (m as any).toolResult ? "result" : "call",
                      });
                    }

                    return parts.map((part, i) => {
                      if (part.type === "text") {
                        if (!part.text) return null;
                        return (
                          <div
                            key={i}
                            className={`px-4 py-3 text-[14px] leading-[1.50] ${
                              isOwnMessage
                                ? "rounded-[8px_8px_0px_8px] bg-[#5645d4] text-white"
                                : "rounded-[8px_8px_8px_0px] border border-[#e5e3df] bg-[#ffffff] text-[#1a1a1a] shadow-sm"
                            }`}
                          >
                            <div className="[&_p]:mb-2 [&_p:last-child]:mb-0 [&_a]:underline [&_strong]:font-semibold break-words">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {part.text}
                              </ReactMarkdown>
                            </div>
                          </div>
                        );
                      }
                      
                      if (part.type === "tool-invocation") {
                        return (
                          <div
                            key={i}
                            className="rounded-[8px] border border-[#e5e3df] bg-[#fafaf9] p-3 w-full shadow-sm"
                          >
                            <div className="flex items-center gap-2 text-[12px] font-medium text-[#5645d4]">
                              {part.state !== "result" && (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              )}
                              <span>
                                {part.state === "result" ? "✓ " : ""}
                                {part.toolName}
                              </span>
                            </div>
                            {part.state === "result" && part.result && (
                              <pre className="mt-2 max-h-[120px] overflow-auto rounded-[8px] bg-[#ffffff] border border-[#e5e3df] p-2 font-mono text-[12px] text-[#787671]">
                                {JSON.stringify(part.result, null, 2)}
                              </pre>
                            )}
                          </div>
                        );
                      }
                      return null;
                    });
                  })()}
                </div>
              </div>
            </div>
          );
        })}
      </div>


      <div className="flex shrink-0 gap-3 border-t border-[#e5e3df] bg-[#ffffff] px-[5%] lg:px-[10%] py-4 items-center shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
        {!aiPaused && (
          <button
            onClick={handleTakeOver}
            disabled={isPending}
            className="group flex h-[44px] px-4 shrink-0 items-center justify-center gap-2 rounded-[8px] border border-[#fca5a5] bg-[#fef2f2] text-[14px] font-medium text-[#dc2626] shadow-sm hover:bg-[#fee2e2] hover:border-[#f87171] transition-all disabled:opacity-50 active:scale-95"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin text-[#dc2626]" />
            ) : (
              <AlertCircle className="h-4 w-4 text-[#dc2626] group-hover:scale-110 transition-transform" />
            )}
            <span className="hidden sm:inline">Take Over</span>
          </button>
        )}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Take over — reply as admin…"
          disabled={isPending}
          className="flex-1 h-[44px] rounded-[8px] border border-[#e5e3df] bg-[#fdfdfc] px-4 text-[14px] leading-[1.50] text-[#1a1a1a] placeholder-[#a4a097] shadow-sm outline-none transition-all hover:border-[#c8c4be] hover:bg-[#ffffff] focus:border-[#5645d4] focus:bg-[#ffffff] focus:ring-[3px] focus:ring-[#5645d4]/10"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) handleSubmit(e as any);
          }}
        />
        <button
          onClick={handleSubmit as any}
          disabled={isPending || !input?.trim()}
          className="flex h-[44px] px-6 shrink-0 items-center justify-center gap-2 rounded-[8px] text-[14px] font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:bg-[#f6f5f4] disabled:text-[#a4a097] enabled:bg-[#5645d4] enabled:text-white enabled:hover:bg-[#4534b3] enabled:shadow-md enabled:hover:shadow-lg enabled:active:scale-95"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>
    </div>
  );
}
