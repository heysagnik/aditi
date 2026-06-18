"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isToolUIPart, getToolName } from "ai";
import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { MessageCircle, X, Send, Loader2, User, Minus, ArrowRight } from "lucide-react";
import { Logo } from "@/components/logo";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import useSWR from "swr";

export function LiveChatWidget() {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Chat form states
  const [chatStarted, setChatStarted] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerIdentifier, setCustomerIdentifier] = useState("");
  const [purpose, setPurpose] = useState("");
  
  // Chat UI states
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Single-session conversation ID (no local storage)
  const [conversationId] = useState(() => crypto.randomUUID());

  const customerNameRef = useRef(customerName);
  const customerIdentifierRef = useRef(customerIdentifier);
  
  useEffect(() => {
    customerNameRef.current = customerName;
    customerIdentifierRef.current = customerIdentifier;
  }, [customerName, customerIdentifier]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        fetch: (url, options) => {
          return fetch(url, {
            ...options,
            headers: {
              ...options?.headers,
              "x-conversation-id": conversationId,
              "x-customer-name": customerNameRef.current,
              "x-customer-identifier": customerIdentifierRef.current,
            },
          });
        },
      }),
    [conversationId]
  );
  
  const { messages, status, sendMessage, error, setMessages } = useChat({ transport });
  const isLoading = status === "streaming" || status === "submitted";

  const fetcher = (url: string) => fetch(url).then(res => res.json());
  
  const { data: syncData } = useSWR(
    chatStarted && isOpen ? `/api/chat/sync?conversationId=${conversationId}` : null,
    fetcher,
    { refreshInterval: 3000 }
  );

  useEffect(() => {
    if (syncData?.messages && !isLoading) {
      // Only append messages if the server has MORE messages than the client.
      if (syncData.messages.length > messages.length) {
        const newMsgs = syncData.messages.slice(messages.length);
        const uiMsgs = newMsgs.map((m: any) => {
           let safeContent = "";
           if (typeof m.content === "string") {
             safeContent = m.content;
           } else if (Array.isArray(m.content)) {
             safeContent = m.content.filter((p:any) => p.type === "text").map((p:any) => p.text).join("\n");
           }

           const parts: any[] = [];
           
           if (safeContent) {
             parts.push({ type: "text", text: safeContent });
           }

           if (m.toolName) {
             parts.push({
               type: "tool-invocation",
               toolInvocationId: m.id,
               toolName: m.toolName,
               args: m.toolArgs,
               result: m.toolResult,
               state: m.toolResult ? "result" : "call",
             });
           }

           return {
             id: m.id,
             role: m.role,
             content: safeContent,
             parts: parts.length > 0 ? parts : [{ type: "text", text: safeContent }]
           };
        });
        setMessages([...messages, ...uiMsgs]);
      }
    }
  }, [syncData?.messages, isLoading, messages, setMessages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  };

  const handleStartChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerIdentifier.trim() || !purpose.trim()) return;
    setChatStarted(true);
    sendMessage({ text: purpose });
  };

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, chatStarted]);

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
    setIsMinimized(false);
  }, []);

  const toggleMinimize = useCallback(() => {
    setIsMinimized((prev) => !prev);
  }, []);

  return (
    <>
      {/* Chat Widget Button */}
      <button
        onClick={toggleOpen}
        className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#5645d4] text-white shadow-[rgba(15,15,15,0.16)_0px_16px_48px_-8px] transition-all hover:bg-[#4534b3] hover:shadow-[rgba(15,15,15,0.24)_0px_20px_56px_-8px] sm:bottom-6 sm:right-6 sm:h-14 sm:w-14"
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <>
          {/* Backdrop — mobile only */}
          <div
            className="fixed inset-0 z-40 bg-black/30 sm:hidden"
            onClick={toggleOpen}
          />
          <div
            className={`fixed z-50 flex flex-col overflow-hidden rounded-[12px] border border-[#e5e3df] bg-white shadow-[rgba(15,15,15,0.16)_0px_16px_48px_-8px] transition-all
              inset-2 sm:inset-auto sm:bottom-24 sm:right-6 sm:w-[380px]
              ${isMinimized ? "h-14 sm:h-14" : "h-[calc(100dvh-16px)] sm:h-[520px]"}
            `}
          >
          {/* Header */}
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-[#e5e3df] bg-[#fafaf9] px-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] bg-white">
                <Logo className="h-5 w-5 text-[#1a1a1a]" />
              </div>
              <div>
                <p className="text-[14px] font-semibold leading-[1.30] tracking-[-0.2px] text-[#1a1a1a]">
                  Aditi Support
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#1aae39]" />
                  <p className="text-[11px] leading-[1.40] text-[#787671]">
                    Online
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={toggleMinimize}
                className="flex h-8 w-8 items-center justify-center rounded-[6px] text-[#787671] transition-colors hover:bg-[#f6f5f4]"
                aria-label={isMinimized ? "Expand" : "Minimize"}
              >
                <Minus className="h-4 w-4" />
              </button>
              <button
                onClick={toggleOpen}
                className="flex h-8 w-8 items-center justify-center rounded-[6px] text-[#787671] transition-colors hover:bg-[#f6f5f4]"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {!chatStarted ? (
                <div className="flex-1 overflow-y-auto p-5">
                  <div className="mb-6 flex flex-col items-center justify-center gap-3 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[12px] border border-[#e5e3df] bg-white">
                      <Logo className="h-6 w-6 text-[#1a1a1a]" />
                    </div>
                    <div>
                      <p className="text-[16px] font-semibold leading-[1.25] tracking-[-0.3px] text-[#1a1a1a]">
                        Hi, I&apos;m Aditi
                      </p>
                      <p className="mt-1 text-[13px] leading-[1.50] text-[#787671]">
                        Please fill out a few details to get started.
                      </p>
                    </div>
                  </div>
                  
                  <form onSubmit={handleStartChat} className="space-y-4">
                    <div className="space-y-1.5">
                      <label htmlFor="name" className="text-[12px] font-medium text-[#1a1a1a]">Name</label>
                      <input
                        id="name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="John Doe"
                        required
                        className="w-full rounded-[8px] border border-[#c8c4be] bg-[#ffffff] px-3 py-2 text-[13px] leading-[1.50] outline-none transition-all focus:border-[#5645d4] focus:ring-1 focus:ring-[#5645d4]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="identifier" className="text-[12px] font-medium text-[#1a1a1a]">Email or Phone</label>
                      <input
                        id="identifier"
                        value={customerIdentifier}
                        onChange={(e) => setCustomerIdentifier(e.target.value)}
                        placeholder="john@example.com"
                        required
                        className="w-full rounded-[8px] border border-[#c8c4be] bg-[#ffffff] px-3 py-2 text-[13px] leading-[1.50] outline-none transition-all focus:border-[#5645d4] focus:ring-1 focus:ring-[#5645d4]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="purpose" className="text-[12px] font-medium text-[#1a1a1a]">How can we help?</label>
                      <textarea
                        id="purpose"
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        placeholder="Describe your issue or question..."
                        required
                        rows={3}
                        className="w-full resize-none rounded-[8px] border border-[#c8c4be] bg-[#ffffff] px-3 py-2 text-[13px] leading-[1.50] outline-none transition-all focus:border-[#5645d4] focus:ring-1 focus:ring-[#5645d4]"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!customerName.trim() || !customerIdentifier.trim() || !purpose.trim()}
                      className="mt-2 flex w-full h-[40px] items-center justify-center gap-2 rounded-[8px] bg-[#5645d4] text-[13px] font-medium text-white transition-colors hover:bg-[#4534b3] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span>Start Conversation</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              ) : (
                <>
                  <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto px-4 py-4"
                  >
                    {messages.map((message) => {
                      const mAny = message as any;
                      if (message.role === "system") {
                        return (
                          <div key={message.id} className="flex justify-center my-3">
                            <div className="flex items-center gap-1.5 rounded-full bg-[#f6f5f4] px-3 py-1 text-[11px] font-medium text-[#787671]">
                              <span>{mAny.content || mAny.text || (mAny.parts && mAny.parts[0]?.text)}</span>
                            </div>
                          </div>
                        );
                      }

                      const isOwnMessage = message.role === "user";
                      const isAI = message.role === "assistant";
                      const isAdmin = mAny.role === "admin";

                      return (
                      <div
                        key={message.id}
                        className={`mb-3 flex w-full ${
                          isOwnMessage ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`flex max-w-[85%] gap-2 ${
                            isOwnMessage
                              ? "flex-row-reverse"
                              : "flex-row"
                          }`}
                        >
                          <div
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] border border-[#e5e3df] ${
                              isAI
                                ? "bg-white"
                                : isAdmin 
                                ? "bg-[#5645d4]" 
                                : "bg-[#f6f5f4]"
                            }`}
                          >
                            {isAI ? (
                              <Logo className="h-3.5 w-3.5 text-[#1a1a1a]" />
                            ) : isAdmin ? (
                              <span className="text-[10px] text-white">Ad</span>
                            ) : (
                              <User className="h-3 w-3 text-[#787671]" />
                            )}
                          </div>

                          <div className={`flex flex-col gap-2 max-w-[85%] ${isOwnMessage ? "items-end" : "items-start"}`}>
                            {message.parts?.map((part, i) => {
                              if (part.type === "text") {
                                if (!part.text) return null;
                                return (
                                  <div
                                    key={i}
                                    className={`text-[13px] leading-[1.50] ${
                                      isOwnMessage
                                        ? "rounded-[10px_10px_4px_10px] bg-[#5645d4] px-3 py-2 text-white"
                                        : "rounded-[10px_10px_10px_4px] border border-[#e5e3df] bg-[#f6f5f4] px-3 py-2 text-[#1a1a1a]"
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
                              if (isToolUIPart(part)) {
                                return (
                                  <div
                                    key={i}
                                    className="rounded-[6px] border border-[#e5e3df] bg-white p-2 w-full shadow-sm"
                                  >
                                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#5645d4]">
                                      {(part as any).state !== "result" && part.state !== "output-available" && (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                      )}
                                      <span>
                                        {(part as any).state === "result" || part.state === "output-available" ? "✓ " : ""}
                                        {getToolName(part)}
                                      </span>
                                    </div>
                                    {(part as any).state === "result" && (part as any).result && (
                                      <pre className="mt-1.5 max-h-[80px] overflow-auto rounded-[4px] bg-[#fafaf9] p-1.5 font-mono text-[10px] text-[#787671]">
                                        {JSON.stringify((part as any).result, null, 2)}
                                      </pre>
                                    )}
                                    {part.state === "output-available" && (
                                      <pre className="mt-1.5 max-h-[80px] overflow-auto rounded-[4px] bg-[#fafaf9] p-1.5 font-mono text-[10px] text-[#787671]">
                                        {JSON.stringify((part as any).output, null, 2)}
                                      </pre>
                                    )}
                                  </div>
                                );
                              }
                              return null;
                            })}
                          </div>
                        </div>
                      </div>
                      );
                    })}

                    {isLoading &&
                      messages[messages.length - 1]?.role !== "assistant" && (
                        <div className="mb-3 flex justify-start">
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] border border-[#e5e3df] bg-white">
                              <Logo className="h-3.5 w-3.5 text-[#1a1a1a]" />
                            </div>
                            <div className="flex items-center gap-1 rounded-[10px_10px_10px_4px] border border-[#e5e3df] bg-[#f6f5f4] px-3 py-2.5">
                              <span className="h-1 w-1 animate-bounce rounded-full bg-[#bbb8b1]" style={{ animationDelay: "0ms" }} />
                              <span className="h-1 w-1 animate-bounce rounded-full bg-[#bbb8b1]" style={{ animationDelay: "150ms" }} />
                              <span className="h-1 w-1 animate-bounce rounded-full bg-[#bbb8b1]" style={{ animationDelay: "300ms" }} />
                            </div>
                          </div>
                        </div>
                      )}

                    {error && (
                      <div className="mb-3 rounded-[8px] border border-[#e03131]/25 bg-[#fef2f2] px-3 py-2 text-center text-[12px] text-[#e03131]">
                        Something went wrong. Try again.
                      </div>
                    )}
                  </div>

                  {/* Input */}
                  <div className="shrink-0 border-t border-[#e5e3df] bg-[#ffffff] px-3 pb-3 pt-2 shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
                    <form
                      onSubmit={handleSubmit}
                      className="flex items-center gap-1.5 rounded-[8px] border border-[#e5e3df] bg-[#fdfdfc] p-1 shadow-sm transition-all focus-within:border-[#5645d4] focus-within:bg-[#ffffff] focus-within:ring-[3px] focus-within:ring-[#5645d4]/10 hover:border-[#c8c4be]"
                    >
                      <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Message Aditi…"
                        disabled={isLoading}
                        className="flex-1 bg-transparent px-2.5 py-1.5 text-[13px] leading-[1.50] text-[#1a1a1a] placeholder-[#a4a097] outline-none"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) handleSubmit(e as any);
                        }}
                      />
                      <button
                        type="submit"
                        disabled={isLoading || !input?.trim()}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] transition-all duration-200 disabled:cursor-not-allowed disabled:bg-[#f6f5f4] disabled:text-[#a4a097] enabled:bg-[#5645d4] enabled:text-white enabled:hover:bg-[#4534b3] enabled:shadow-sm enabled:active:scale-95"
                      >
                        {isLoading ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Send className="h-3 w-3" />
                        )}
                      </button>
                    </form>
                    <p className="mt-1.5 text-center text-[10px] leading-[1.40] text-[#a4a097]">
                      Aditi can make mistakes.
                    </p>
                  </div>
                </>
              )}
            </>
          )}
          </div>
        </>
      )}
    </>
  );
}
