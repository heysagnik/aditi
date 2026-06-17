"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRef, useEffect, useState, useMemo } from "react";
import { Bot, User, Loader2 } from "lucide-react";

export default function ChatPage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");

  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const { messages, status, sendMessage, error } = useChat({ transport });
  const isLoading = status === "streaming" || status === "submitted";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  };

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex min-h-full flex-col">
      {/* Header */}
      <header className="border-b border-zinc-200 px-6 py-4 ">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Chat with Aditi</h1>
            <p className="text-sm text-zinc-500">
              Our AI support agent is here to help.
            </p>
          </div>
          <a
            href="/login"
            className="text-sm text-zinc-500 underline hover:text-zinc-700"
          >
            Admin login
          </a>
        </div>
      </header>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 overflow-y-auto px-4 py-8"
      >
        {messages.length === 0 && (
          <div className="flex flex-1 items-center justify-center text-zinc-400">
            <p>Start a conversation by typing a message below.</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex w-full ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div className={`flex max-w-[85%] gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              <Avatar className="shrink-0 w-8 h-8">
                <AvatarFallback className={message.role === "assistant" ? "bg-primary text-primary-foreground" : ""}>
                  {message.role === "user" ? <User size={16} /> : <Bot size={16} />}
                </AvatarFallback>
              </Avatar>

              <div
                className={`rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm ${
                  message.role === "user"
                    ? "bg-foreground text-background"
                    : "bg-zinc-100 text-zinc-900 border border-zinc-200"
                }`}
              >
                {message.parts?.map((part, i) => {
                  if (part.type === "text") {
                    return (
                      <span key={i} className="whitespace-pre-wrap">
                        {part.text}
                      </span>
                    );
                  }
                  if (part.type === "tool-invocation") {
                    const inv = (part as any).toolInvocation;
                    return (
                      <div
                        key={i}
                        className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs"
                      >
                        <div className="flex items-center gap-2 font-medium text-zinc-700">
                          <Loader2 size={16} className="animate-spin" />
                          <span>Executing: {inv.toolName}</span>
                        </div>
                        {inv.state === "result" && (
                          <div className="mt-2 max-h-40 overflow-auto rounded bg-zinc-100 p-2 font-mono text-[10px] text-zinc-600">
                            {JSON.stringify(inv.result, null, 2)}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex justify-start">
            <div className="flex max-w-[85%] gap-3 flex-row">
              <Avatar className="shrink-0 w-8 h-8">
                <AvatarFallback className="bg-primary text-primary-foreground"><Bot size={16} /></AvatarFallback>
              </Avatar>
              <div className="rounded-2xl bg-zinc-100 border border-zinc-200 px-5 py-3.5 shadow-sm">
                <Loader2 size={16} className="animate-spin" />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center text-sm text-red-500">
            Something went wrong. Please try again.
          </div>
        )}
      </div>

      {/* Input */}
      <footer className="border-t border-zinc-200 px-6 py-4 ">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-2xl gap-3"
        >
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message…"
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
      </footer>
    </div>
  );
}
