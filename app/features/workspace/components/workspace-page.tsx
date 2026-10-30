"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { type DocumentItem } from "./document-list";
import { WorkspaceHeader } from "./workspace-header";
import { ChatPanel } from "./chat-panel";
import { useDocuments } from "../hooks/use-documents";
import { useDeleteDocument } from "../hooks/use-delete-document";
import { useDeleteDocuments } from "../hooks/use-delete-documents";
import { useDeleteThread } from "../hooks/use-delete-thread";
import { useUploadDocument } from "../hooks/use-upload-document";
import { useUpdateThread } from "../hooks/use-update-thread";
import { useChat } from "../hooks/use-chat";
import { ThreadItem, WorkspaceSidebar } from "./workspace-sidebar";
import { createThread, getThreads } from "../services/chat-service";

export function WorkspacePage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const startedPendingRef = useRef<string | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [threads, setThreads] = useState<ThreadItem[]>([]);
  const [threadsLoading, setThreadsLoading] = useState(true);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    () => searchParams.get("document_id"),
  );

  const threadId = pathname.startsWith("/chat/")
    ? pathname.split("/")[2] || null
    : null;

  const selectedThreadId = threadId;
  const pendingQuestion = searchParams.get("q");
  const pendingDocumentId = searchParams.get("document_id");

  const uploadMutation = useUploadDocument();
  const deleteThreadMutation = useDeleteThread();
  const deleteDocumentMutation = useDeleteDocument();
  const deleteDocumentsMutation = useDeleteDocuments();
  const documentsQuery = useDocuments();
  const updateThreadMutation = useUpdateThread();

  const documents: DocumentItem[] =
    documentsQuery.data?.documents.map((document) => ({
      id: document.id,
      name: document.filename,
      fileUrl: document.file_url,
      status: document.status,
    })) ?? [];

  const selectedDocument = documents.find(
    (document) => document.id === selectedDocumentId,
  );

  const selectedThread = threads.find(
    (thread) => thread.id === selectedThreadId,
  );

  const {
    messages,
    loadingHistory,
    streaming,
    error,
    sendMessage,
    stopGeneration,
  } = useChat(threadId);

  useEffect(() => {
    let cancelled = false;

    getThreads()
      .then((items) => {
        if (!cancelled) {
          setThreads(
            items.map((thread) => ({
              id: thread.id,
              title: thread.title,
            })),
          );
        }
      })
      .catch(() => {
        if (!cancelled) {
          toast.error("Could not load your conversations.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setThreadsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Resume the first question after navigation to /chat/{threadId}.
  useEffect(() => {
    if (!threadId || !pendingQuestion || loadingHistory) return;

    const key = `${threadId}:${pendingQuestion}:${pendingDocumentId ?? ""}`;

    if (startedPendingRef.current === key) return;
    startedPendingRef.current = key;

    const documentParams = new URLSearchParams();
    if (pendingDocumentId) {
      documentParams.set("document_id", pendingDocumentId);
    }
    const query = documentParams.toString();
    router.replace(`/chat/${threadId}${query ? `?${query}` : ""}`, {
      scroll: false,
    });

    void sendMessage(pendingQuestion, pendingDocumentId);
  }, [
    threadId,
    pendingQuestion,
    pendingDocumentId,
    loadingHistory,
    sendMessage,
    router,
  ]);

  const handleNewChat = useCallback(() => {
    setSelectedDocumentId(null);
    router.push("/dashboard");
  }, [router]);

  const handleSelectThread = useCallback(
    (id: string) => {
      router.push(`/chat/${id}`);
    },
    [router],
  );

  const handleSelectDocument = useCallback(
    (id: string | null) => {
      setSelectedDocumentId(id);

      const params = new URLSearchParams(searchParams.toString());
      if (id) {
        params.set("document_id", id);
      } else {
        params.delete("document_id");
      }

      const query = params.toString();
      router.replace(`${pathname}${query ? `?${query}` : ""}`, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  const handleDeleteDocument = useCallback(
    async (document: DocumentItem) => {
      await deleteDocumentMutation.mutateAsync(document.id);
      if (selectedDocumentId === document.id) {
        handleSelectDocument(null);
      }
    },
    [
      deleteDocumentMutation,
      handleSelectDocument,
      selectedDocumentId,
    ],
  );

  const handleDeleteDocuments = useCallback(
    async (selectedDocuments: DocumentItem[]) => {
      const result = await deleteDocumentsMutation.mutateAsync(
        selectedDocuments.map((document) => document.id),
      );
      if (result.deletedDocumentIds.includes(selectedDocumentId ?? "")) {
        handleSelectDocument(null);
      }
      return result.failedDocumentIds;
    },
    [deleteDocumentsMutation, handleSelectDocument, selectedDocumentId],
  );

  const handleRenameThread = useCallback(
    async (id: string, title: string) => {
      const updatedThread = await updateThreadMutation.mutateAsync({
        threadId: id,
        title,
      });

      setThreads((current) =>
        current.map((thread) =>
          thread.id === id
            ? { ...thread, title: updatedThread.title || title }
            : thread,
        ),
      );
    },
    [updateThreadMutation],
  );

  const handleDeleteThread = useCallback(
    async (id: string) => {
      await deleteThreadMutation.mutateAsync(id);
      setThreads((current) => current.filter((thread) => thread.id !== id));

      if (id === selectedThreadId) {
        router.push("/dashboard");
      }
    },
    [deleteThreadMutation, router, selectedThreadId],
  );

  async function handleSend(message: string) {
    if (streaming || !message.trim()) return;

    try {
      const documentId = selectedDocumentId || undefined;

      if (!threadId) {
        const thread = await createThread(
          message.trim().slice(0, 80) || "New chat",
        );

        setThreads((current) => [
          { id: thread.id, title: thread.title },
          ...current.filter((item) => item.id !== thread.id),
        ]);

        const params = new URLSearchParams({ q: message.trim() });

        if (documentId) {
          params.set("document_id", documentId);
        }

        router.push(`/chat/${thread.id}?${params.toString()}`);
        return;
      }

      await sendMessage(message.trim(), documentId);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not start conversation.",
      );
    }
  }

  async function handleUpload(fileList: FileList | null) {
    if (!fileList?.length) return;

    for (const file of Array.from(fileList)) {
      try {
        const result = await uploadMutation.mutateAsync(file);
        const uploadedId = result.id ?? result.document?.id;

        if (uploadedId) {
          setSelectedDocumentId(uploadedId);
          await documentsQuery.refetch();
        }
      } catch {
        // The upload hook already displays an error toast.
      }
    }
  }

  return (
    <main className="flex h-[100dvh] overflow-hidden bg-background">
      {sidebarOpen && (
        <WorkspaceSidebar
          documents={documents}
          documentsLoading={documentsQuery.isLoading}
          documentsError={
            documentsQuery.isError
              ? "Unable to load documents. Please try again."
              : undefined
          }
          onDeleteDocument={handleDeleteDocument}
          onDeleteDocuments={handleDeleteDocuments}
          deletingDocumentId={
            deleteDocumentMutation.isPending
              ? deleteDocumentMutation.variables
              : null
          }
          deletingDocuments={deleteDocumentsMutation.isPending}
          threads={threads}
          threadsLoading={threadsLoading}
          selectedDocumentId={selectedDocumentId}
          selectedThreadId={selectedThreadId}
          onSelectDocument={handleSelectDocument}
          onSelectThread={handleSelectThread}
          onNewChat={handleNewChat}
          onRenameThread={handleRenameThread}
          onDeleteThread={handleDeleteThread}
        />
      )}

      <section className="flex min-w-0 flex-1 flex-col">
        <WorkspaceHeader
          title={selectedThread?.title ?? "Your workspace"}
          selectedDocumentName={selectedDocument?.name}
          onToggleSidebar={() => setSidebarOpen((open) => !open)}
          onUpload={() => fileInputRef.current?.click()}
        />

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.txt,.doc,.docx,.csv"
          className="hidden"
          onChange={(event) => {
            void handleUpload(event.target.files);
            event.target.value = "";
          }}
        />

        <ChatPanel
          selectedDocument={selectedDocument}
          messages={messages}
          loadingHistory={loadingHistory}
          streaming={streaming}
          error={error}
          onSend={(message) => void handleSend(message)}
          onStop={stopGeneration}
        />
      </section>
    </main>
  );
}
