"use client";

import { FileText, Sparkles, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatInput } from "./chat-input";
import type { ChatMessage as ChatMessageType } from "../services/chat-service";
import { ChatCitations } from "./chat-citation";
import { MarkdownRenderer } from "./markdown-renderer";
import { MessageUsage } from "./message-usage";
import { useEffect, useRef } from "react";

type ChatPanelProps = {
  selectedDocument?: {
    name: string;
    fileUrl?: string;
  };
  messages: ChatMessageType[];
  loadingHistory: boolean;
  streaming: boolean;
  error: string | null;
  onSend: (message: string) => void;
  onStop: () => void;
};

export function ChatPanel({
  selectedDocument,
  messages,
  loadingHistory,
  streaming,
  error,
  onSend,
  onStop,
}: ChatPanelProps) {
  const isEmpty = messages.length === 0 && !loadingHistory;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);

  function handleChatScroll() {
    const container = scrollContainerRef.current;
    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    shouldAutoScrollRef.current = distanceFromBottom < 120;
  }

  useEffect(() => {
    if (!shouldAutoScrollRef.current) return;

    messagesEndRef.current?.scrollIntoView({
      behavior: "auto",
      block: "end",
    });
  }, [messages, streaming]);

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 sm:px-6">
        {isEmpty ? (
          <div className="flex h-full flex-col items-center justify-center py-10">
            <div className="mb-5 flex size-14 items-center justify-center rounded-2xl border bg-muted/40">
              <Sparkles className="size-7" />
            </div>

            <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
              What would you like to know?
            </h2>

            <p className="mt-3 max-w-lg text-center text-sm leading-6 text-muted-foreground">
              Ask questions about your documents and get AI-powered answers
              grounded in your knowledge base.
            </p>

            {selectedDocument && (
              <div className="mt-6 flex max-w-full items-center gap-2 rounded-full border px-4 py-2 text-sm">
                <FileText className="size-4 shrink-0" />
                <span className="truncate">{selectedDocument.name}</span>
              </div>
            )}
          </div>
        ) : loadingHistory ? (
          <div className="space-y-5 py-8">
            <div className="h-16 animate-pulse rounded-xl bg-muted/60" />
            <div className="h-24 animate-pulse rounded-xl bg-muted/60" />
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-7 py-8">
            {messages.map((message) => {
              const isUser = message.role === "user";
              const isLastMessage =
                message.id === messages[messages.length - 1]?.id;

              return (
                <article
                  key={message.id}
                  className={`flex gap-3 ${
                    isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  {!isUser && (
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                      <Sparkles className="size-4" />
                    </div>
                  )}

                  <div
                    className={
                      isUser
                        ? "max-w-[85%] break-words rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm leading-6 text-primary-foreground"
                        : "min-w-0 flex-1 break-words py-1 text-sm leading-7"
                    }
                  >
                    {message.content ? (
                      <MarkdownRenderer content={message.content} />
                    ) : !isUser && streaming && isLastMessage ? (
                      <span className="inline-flex gap-1" aria-label="Thinking">
                        <span className="animate-bounce">●</span>
                        <span className="animate-bounce [animation-delay:150ms]">
                          ●
                        </span>
                        <span className="animate-bounce [animation-delay:300ms]">
                          ●
                        </span>
                      </span>
                    ) : null}

                    {!isUser &&
                      streaming &&
                      isLastMessage &&
                      message.content && (
                        <span className="ml-1 inline-block h-4 w-1 animate-pulse rounded bg-primary align-middle" />
                      )}

                    {!isUser && message.metadata?.citations && (
                      <ChatCitations citations={message.metadata.citations} />
                    )}
                    {!isUser && message.metadata?.usage && (
                      <div className="mt-2">
                        <MessageUsage usage={message.metadata.usage} />
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}

        {error && (
          <p
            role="alert"
            className="mx-auto max-w-3xl pb-3 text-sm text-destructive"
          >
            {error}
          </p>
        )}
      </div>

      {streaming && (
        <div className="px-4 pb-2 sm:px-6">
          <div className="mx-auto flex max-w-3xl justify-end">
            <Button variant="outline" size="sm" onClick={onStop}>
              <Square className="mr-2 size-3" />
              Stop generating
            </Button>
          </div>
        </div>
      )}

      <ChatInput
        selectedDocument={selectedDocument}
        onSend={onSend}
        disabled={streaming || loadingHistory}
      />
    </section>
  );
}
