"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type UIMessage = {
  id: string;
  role: "user" | "assistant";
  parts: Array<{ type: "text"; text: string }>;
};

export function ConversationThread({
  conversationId,
  initialMessages,
}: {
  conversationId: string;
  initialMessages: UIMessage[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");

  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat", body: { conversationId } }), [conversationId]);
  const { messages, status, sendMessage } = useChat({
    transport,
    messages: initialMessages,
  });
  const isLoading = status === "streaming" || status === "submitted";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-zinc-200 ">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-zinc-100 text-zinc-900 "
              }`}
            >
              {m.parts?.map((part, i) =>
                part.type === "text" ? (
                  <span key={i} className="whitespace-pre-wrap">
                    {part.text}
                  </span>
                ) : null
              )}
            </div>
          </div>
        ))}
        {isLoading &&
          messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-zinc-100 px-4 py-3 text-sm ">
                …
              </div>
            </div>
          )}
      </div>

      {/* Take-over input */}
      <form
        onSubmit={handleSubmit}
        className="flex gap-3 border-t border-zinc-200 p-4 "
      >
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Take over — type a reply as the admin…"
          className="flex-1"
          disabled={isLoading}
        />
        <Button
          type="submit"
          className="bg-primary text-primary-foreground"
          disabled={isLoading || !input?.trim()}
        >
          Send
        </Button>
      </form>
    </div>
  );
}
