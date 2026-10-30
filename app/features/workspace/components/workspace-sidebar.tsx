"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  LogOut,
  MoreHorizontal,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { useCurrentUser } from "@/app/features/auth/hooks/use-current-user";
import { useLogout } from "@/app/features/auth/hooks/use-logout";

import { DocumentList, type DocumentItem } from "./document-list";
import {
  SidebarProfileSkeleton,
  SidebarRowsSkeleton,
} from "./workspace-sidebar-skeleton";

export type ThreadItem = {
  id: string;
  title: string;
};

type WorkspaceSidebarProps = {
  documents: DocumentItem[];
  documentsLoading?: boolean;
  documentsError?: string;
  onDeleteDocument: (document: DocumentItem) => Promise<void>;
  onDeleteDocuments: (documents: DocumentItem[]) => Promise<string[]>;
  deletingDocumentId?: string | null;
  deletingDocuments?: boolean;
  threads: ThreadItem[];
  threadsLoading?: boolean;
  selectedDocumentId: string | null;
  selectedThreadId: string | null;
  onSelectDocument: (id: string | null) => void;
  onSelectThread: (id: string) => void;
  onNewChat: () => void;
  onRenameThread: (id: string, title: string) => Promise<void>;
  onDeleteThread: (id: string) => Promise<void>;
};

type ThreadDialogState =
  | { mode: "rename"; thread: ThreadItem }
  | { mode: "delete"; thread: ThreadItem }
  | null;

export function WorkspaceSidebar({
  documents,
  documentsLoading,
  documentsError,
  onDeleteDocument,
  onDeleteDocuments,
  deletingDocumentId,
  deletingDocuments,
  threads,
  threadsLoading = false,
  selectedDocumentId,
  selectedThreadId,
  onSelectDocument,
  onSelectThread,
  onNewChat,
  onRenameThread,
  onDeleteThread,
}: WorkspaceSidebarProps) {
  const router = useRouter();
  const currentUserQuery = useCurrentUser();
  const logoutMutation = useLogout();
  const [threadDialog, setThreadDialog] = useState<ThreadDialogState>(null);
  const [title, setTitle] = useState("");

  async function handleLogout() {
    try {
      const result = await logoutMutation.mutateAsync();
      if (result.serverLogoutSucceeded) {
        toast.success("Signed out successfully.");
      } else {
        toast.warning("Signed out on this device", {
          description: "The server could not confirm session revocation.",
        });
      }
      router.replace("/sign-in");
    } catch {
      toast.error("Could not clear your local session.");
    }
  }

  function getUserInitials(name: string): string {
    const initials = name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("");

    return initials.toLocaleUpperCase() || "?";
  }

  function openRenameDialog(thread: ThreadItem) {
    setTitle(thread.title);
    setThreadDialog({ mode: "rename", thread });
  }

  function openDeleteDialog(thread: ThreadItem) {
    setThreadDialog({ mode: "delete", thread });
  }

  async function submitRename(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (threadDialog?.mode !== "rename" || !title.trim()) return;

    try {
      await onRenameThread(threadDialog.thread.id, title.trim());
      setThreadDialog(null);
    } catch {
      // The mutation hook displays the request error.
    }
  }

  async function confirmDelete() {
    if (threadDialog?.mode !== "delete") return;

    try {
      await onDeleteThread(threadDialog.thread.id);
      setThreadDialog(null);
    } catch {
      // The mutation hook displays the request error.
    }
  }

  return (
    <aside className="flex w-72 shrink-0 flex-col border-r bg-muted/20">
      <div className="flex h-16 items-center gap-2 border-b px-4">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Sparkles className="size-5" />
        </div>
        <span className="flex-1 font-semibold">RAG Workspace</span>
        <ThemeToggle />
      </div>

      <div className="p-3">
        <Button
          className="h-12 w-full justify-start gap-3 rounded-xl px-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          onClick={onNewChat}
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary-foreground/15">
            <Plus className="size-4" />
          </span>
          <span className="flex flex-col items-start gap-0.5">
            <span className="text-sm font-semibold">New chat</span>
            <span className="text-[11px] font-normal text-primary-foreground/75">
              Start a fresh conversation
            </span>
          </span>
        </Button>
      </div>

      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-3 py-3">
        <section className="space-y-2">
          <h2 className="px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Conversations
          </h2>

          {threadsLoading ? (
            <SidebarRowsSkeleton rows={4} />
          ) : threads.length === 0 ? (
            <p className="px-2 py-3 text-sm text-muted-foreground">
              Your threads will appear here.
            </p>
          ) : (
            threads.map((thread) => (
              <div
                key={thread.id}
                className={`group relative flex items-center rounded-lg hover:bg-accent ${
                  selectedThreadId === thread.id ? "bg-accent" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectThread(thread.id)}
                  className="min-w-0 flex-1 truncate px-2 py-2 text-left text-sm"
                >
                  {thread.title}
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Actions for ${thread.title}`}
                        className="mr-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100"
                      />
                    }
                  >
                    <MoreHorizontal className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" side="bottom">
                    <DropdownMenuItem onClick={() => openRenameDialog(thread)}>
                      <Pencil className="size-4" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => openDeleteDialog(thread)}
                    >
                      <Trash2 className="size-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          )}
        </section>

        <DocumentList
          documents={documents}
          selectedId={selectedDocumentId}
          onSelect={onSelectDocument}
          onDelete={onDeleteDocument}
          onDeleteDocuments={onDeleteDocuments}
          deletingDocumentId={deletingDocumentId}
          deletingDocuments={deletingDocuments}
          isLoading={documentsLoading}
          error={documentsError}
        />
      </div>

      <div className="border-t p-3">
        {currentUserQuery.isPending ? (
          <SidebarProfileSkeleton />
        ) : currentUserQuery.isError || !currentUserQuery.data ? (
          <div className="flex items-center justify-between gap-2 px-1 py-2 text-xs text-destructive">
            <span>Could not load your account.</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => void currentUserQuery.refetch()}
            >
              Retry
            </Button>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  className="h-auto w-full justify-start gap-3 rounded-xl border border-transparent px-2.5 py-2.5 text-left transition-colors hover:border-border hover:bg-background"
                  aria-label={
                    currentUserQuery.data
                      ? `Account menu for ${currentUserQuery.data.name}`
                      : "Account menu"
                  }
                />
              }
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {getUserInitials(currentUserQuery.data.name)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">
                  {currentUserQuery.data.name}
                </span>
                <span className="block truncate text-xs font-normal text-muted-foreground">
                  {currentUserQuery.data.email}
                </span>
              </span>
              <UserRound className="size-4 shrink-0 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              side="top"
              sideOffset={8}
              className="w-64 min-w-64 rounded-xl p-2 shadow-xl"
            >
              <div className="flex items-center gap-3 rounded-lg bg-muted/60 p-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-sm">
                  {getUserInitials(currentUserQuery.data.name)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">
                    {currentUserQuery.data.name}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                    {currentUserQuery.data.email}
                  </span>
                </span>
              </div>
              <DropdownMenuSeparator className="my-2" />
              <DropdownMenuItem
                variant="destructive"
                disabled={logoutMutation.isPending}
                onClick={() => void handleLogout()}
                className="h-10 rounded-lg px-3"
              >
                <LogOut className="size-4" />
                {logoutMutation.isPending ? "Signing out…" : "Sign out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {threadDialog && (
        <ThreadDialog
          state={threadDialog}
          title={title}
          onTitleChange={setTitle}
          onRename={submitRename}
          onDelete={confirmDelete}
          onClose={() => setThreadDialog(null)}
        />
      )}
    </aside>
  );
}

function ThreadDialog({
  state,
  title,
  onTitleChange,
  onRename,
  onDelete,
  onClose,
}: {
  state: Exclude<ThreadDialogState, null>;
  title: string;
  onTitleChange: (title: string) => void;
  onRename: (event: React.FormEvent<HTMLFormElement>) => void;
  onDelete: () => Promise<void>;
  onClose: () => void;
}) {
  if (state.mode === "rename") {
    return (
      <Dialog
        open
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename conversation</DialogTitle>
            <DialogDescription>
              Choose a new title for this conversation.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(event) => void onRename(event)}>
            <Label htmlFor="thread-title">Conversation title</Label>
            <Input
              id="thread-title"
              autoFocus
              value={title}
              onChange={(event) => onTitleChange(event.target.value)}
              maxLength={160}
              required
              className="mt-2"
            />
            <DialogFooter className="mt-5">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={!title.trim()}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <AlertDialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
          <AlertDialogDescription>
            “{state.thread.title}” will be permanently deleted. This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => void onDelete()}
          >
            Delete conversation
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
