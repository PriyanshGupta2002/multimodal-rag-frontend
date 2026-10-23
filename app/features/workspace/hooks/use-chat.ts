"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getThreadMessages, type ChatMessage } from "../services/chat-service";
import { streamChat } from "../services/chat-stream";

export function useChat(threadId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(Boolean(threadId));
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [citations, setCitations] = useState<unknown[]>([]);
  const [messagesThreadId, setMessagesThreadId] = useState<string | null>(null);

  const controllerRef = useRef<AbortController | null>(null);
  const streamingRef = useRef(false);

  // Load conversation history when thread changes.
  const loadMessages = useCallback(async (id: string) => {
    const result = await getThreadMessages(id);
    setMessages(result);
    setMessagesThreadId(id);

    // Keep citations available from the latest assistant message.
    const latestAssistant = [...result]
      .reverse()
      .find((item) => item.role === "assistant");

    setCitations(latestAssistant?.metadata?.citations ?? []);
  }, []);

  useEffect(() => {
    if (!threadId) return;

    let cancelled = false;

    async function load() {
      setLoadingHistory(true);
      setError(null);

      try {
        const result = await getThreadMessages(threadId!);

        if (!cancelled) {
          setMessages(result);
          setMessagesThreadId(threadId!);

          const latestAssistant = [...result]
            .reverse()
            .find((item) => item.role === "assistant");

          setCitations(latestAssistant?.metadata?.citations ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load conversation.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingHistory(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
      controllerRef.current?.abort();
      controllerRef.current = null;
      streamingRef.current = false;
    };
  }, [threadId]);

  const sendMessage = useCallback(
    async (message: string, documentId?: string | null) => {
      if (!threadId || streamingRef.current || !message.trim()) return;

      streamingRef.current = true;
      setStreaming(true);
      setError(null);
      setCitations([]);

      const controller = new AbortController();
      controllerRef.current = controller;

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        thread_id: threadId,
        role: "user",
        content: message.trim(),
      };

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        thread_id: threadId,
        role: "assistant",
        content: "",
      };

      setMessagesThreadId(threadId);
      setMessages((current) => [...current, userMessage, assistantMessage]);

      try {
        await streamChat(
          {
            thread_id: threadId,
            message: message.trim(),
            document_id: documentId || null,
          },
          {
            signal: controller.signal,

            onToken: (token) => {
              setMessages((current) =>
                current.map((item) =>
                  item.id === assistantMessage.id
                    ? { ...item, content: item.content + token }
                    : item,
                ),
              );
            },

            onCitations: (items) => {
              setCitations(items);

              // Attach streaming citations to the assistant message.
              setMessages((current) =>
                current.map((item) =>
                  item.id === assistantMessage.id
                    ? {
                        ...item,
                        metadata: {
                          ...item.metadata,
                          citations: items as ChatMessage["metadata"] extends {
                            citations?: infer T;
                          }
                            ? T
                            : never,
                        },
                      }
                    : item,
                ),
              );
            },
          },
        );

        // Streaming ended: fetch persisted messages and citations.
        if (!controller.signal.aborted) {
          try {
            await loadMessages(threadId);
          } catch (refreshError) {
            console.error(
              "Failed to refresh messages after streaming:",
              refreshError,
            );
            // Keep the streamed answer visible if refreshing fails.
          }
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to generate answer.";

          setError(errorMessage);
          toast.error(errorMessage);
        }
      } finally {
        if (controllerRef.current === controller) {
          controllerRef.current = null;
          streamingRef.current = false;
          setStreaming(false);
        }
      }
    },
    [threadId, loadMessages],
  );

  const stopGeneration = useCallback(() => {
    controllerRef.current?.abort();
  }, []);

  const visibleMessages =
    threadId && messagesThreadId === threadId ? messages : [];

  return {
    messages: visibleMessages,
    loadingHistory:
      Boolean(threadId) && (loadingHistory || messagesThreadId !== threadId),
    streaming,
    error,
    citations,
    sendMessage,
    stopGeneration,
  };
}
