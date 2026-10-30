"use client";

import { useEffect, useState } from "react";
import {
  ChevronDown,
  Eye,
  FileText,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { useDocumentStatus } from "../hooks/use-document-status";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DocumentPreviewDialog } from "./document-preview-dialog";
import { SidebarRowsSkeleton } from "./workspace-sidebar-skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type DocumentItem = {
  id: string;
  name: string;
  fileUrl?: string;
  status?: string;
};

type DocumentListProps = {
  documents: DocumentItem[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onDelete: (document: DocumentItem) => Promise<void>;
  onDeleteDocuments: (documents: DocumentItem[]) => Promise<string[]>;
  deletingDocumentId?: string | null;
  deletingDocuments?: boolean;
  isLoading?: boolean;
  error?: string;
};

export function DocumentList({
  documents,
  selectedId,
  onSelect,
  onDelete,
  onDeleteDocuments,
  deletingDocumentId,
  deletingDocuments = false,
  isLoading = false,
  error,
}: DocumentListProps) {
  const [previewDocument, setPreviewDocument] = useState<DocumentItem | null>(
    null,
  );
  const [documentToDelete, setDocumentToDelete] =
    useState<DocumentItem | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const selectedDocuments = documents.filter((document) =>
    selectedDocumentIds.includes(document.id),
  );

  useEffect(() => {
    const documentIds = new Set(documents.map((document) => document.id));
    setSelectedDocumentIds((current) => {
      const next = current.filter((id) => documentIds.has(id));
      return next.length === current.length ? current : next;
    });
  }, [documents]);

  async function confirmDelete() {
    if (!documentToDelete) return;

    try {
      await onDelete(documentToDelete);
      setDocumentToDelete(null);
    } catch {
      // The deletion hook displays the request error.
    }
  }

  async function confirmDeleteSelected() {
    if (selectedDocuments.length === 0) return;

    try {
      const failedIds = await onDeleteDocuments(selectedDocuments);
      setSelectedDocumentIds(failedIds);
      setSelectionMode(failedIds.length > 0);
      setBulkDeleteOpen(false);
    } catch {
      // The deletion hook displays the request error.
    }
  }

  function toggleDocumentSelection(documentId: string, checked: boolean) {
    setSelectedDocumentIds((current) =>
      checked
        ? current.includes(documentId)
          ? current
          : [...current, documentId]
        : current.filter((id) => id !== documentId),
    );
  }

  return (
    <section className="space-y-2">
      <Collapsible open={expanded} onOpenChange={setExpanded}>
        <div className="flex items-center gap-1">
          <CollapsibleTrigger
            className="group flex min-w-0 flex-1 items-center justify-between rounded-lg px-2 py-2 text-left hover:bg-accent"
            aria-label={`${expanded ? "Collapse" : "Expand"} documents`}
          >
            <span className="flex items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Documents
              </span>
              {!isLoading && !error && documents.length > 0 && (
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] tabular-nums text-muted-foreground">
                  {documents.length}
                </span>
              )}
            </span>
            <ChevronDown
              className={`size-4 text-muted-foreground transition-transform ${
                expanded ? "" : "-rotate-90"
              }`}
            />
          </CollapsibleTrigger>
          {!isLoading && !error && documents.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              disabled={deletingDocuments}
              onClick={() => {
                setSelectionMode((current) => !current);
                setSelectedDocumentIds([]);
              }}
            >
              {selectionMode ? "Cancel" : "Select"}
            </Button>
          )}
        </div>

        <CollapsibleContent>
          {isLoading ? (
            <SidebarRowsSkeleton rows={3} />
          ) : error ? (
            <p className="px-2 py-3 text-sm text-destructive">{error}</p>
          ) : documents.length === 0 ? (
            <p className="px-2 py-3 text-sm text-muted-foreground">
              No documents yet.
            </p>
          ) : (
            <>
              {selectionMode && (
                <div className="flex items-center justify-between gap-1 px-2 py-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    disabled={deletingDocuments}
                    onClick={() =>
                      setSelectedDocumentIds(
                        selectedDocuments.length === documents.length
                          ? []
                          : documents.map((document) => document.id),
                      )
                    }
                  >
                    {selectedDocuments.length === documents.length
                      ? "Clear selection"
                      : "Select all"}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="xs"
                    disabled={
                      selectedDocuments.length === 0 || deletingDocuments
                    }
                    onClick={() => setBulkDeleteOpen(true)}
                  >
                    <Trash2 />
                    Delete{selectedDocuments.length > 0
                      ? ` (${selectedDocuments.length})`
                      : ""}
                  </Button>
                </div>
              )}
              {documents.map((document) => (
                <DocumentRow
                  key={document.id}
                  document={document}
                  selected={selectedId === document.id}
                  isSelectedForDelete={selectedDocumentIds.includes(
                    document.id,
                  )}
                  selectionMode={selectionMode}
                  onSelect={onSelect}
                  onSelectForDelete={(checked) =>
                    toggleDocumentSelection(document.id, checked)
                  }
                  onPreview={setPreviewDocument}
                  onDelete={() => setDocumentToDelete(document)}
                  isDeleting={
                    deletingDocumentId === document.id || deletingDocuments
                  }
                />
              ))}
            </>
          )}
        </CollapsibleContent>
      </Collapsible>
      {previewDocument && (
        <DocumentPreviewDialogWrapper
          document={previewDocument}
          onClose={() => setPreviewDocument(null)}
        />
      )}
      <AlertDialog
        open={documentToDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deletingDocumentId) setDocumentToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this document?</AlertDialogTitle>
            <AlertDialogDescription>
              {documentToDelete
                ? `“${documentToDelete.name}” will be permanently deleted from your workspace.`
                : "This document will be permanently deleted from your workspace."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={Boolean(deletingDocumentId)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={!documentToDelete || Boolean(deletingDocumentId)}
              onClick={(event) => {
                event.preventDefault();
                void confirmDelete();
              }}
            >
              {deletingDocumentId ? "Deleting…" : "Delete document"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        open={bulkDeleteOpen}
        onOpenChange={(open) => {
          if (!deletingDocuments) setBulkDeleteOpen(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {selectedDocuments.length} documents?
            </AlertDialogTitle>
            <AlertDialogDescription>
              The selected documents will be permanently deleted from your
              workspace. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingDocuments}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={selectedDocuments.length === 0 || deletingDocuments}
              onClick={(event) => {
                event.preventDefault();
                void confirmDeleteSelected();
              }}
            >
              {deletingDocuments ? "Deleting…" : "Delete documents"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

function DocumentRow({
  document,
  selected,
  isSelectedForDelete,
  selectionMode,
  onSelect,
  onSelectForDelete,
  onPreview,
  onDelete,
  isDeleting,
}: {
  document: DocumentItem;
  selected: boolean;
  isSelectedForDelete: boolean;
  selectionMode: boolean;
  onSelect: (id: string | null) => void;
  onSelectForDelete: (checked: boolean) => void;
  onPreview: (document: DocumentItem) => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const statusQuery = useDocumentStatus(document.id, document.status);
  const status = statusQuery.data?.status ?? document.status;

  return (
    <div
      className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-accent ${
        selected ? "bg-accent" : ""
      }`}
    >
      {selectionMode ? (
        <Checkbox
          checked={isSelectedForDelete}
          disabled={isDeleting}
          onCheckedChange={(checked) => onSelectForDelete(checked === true)}
          aria-label={`Select ${document.name} for deletion`}
        />
      ) : (
        <Checkbox
          checked={selected}
          onCheckedChange={(checked) =>
            onSelect(checked ? document.id : null)
          }
          aria-label={`Use ${document.name} for chat`}
        />
      )}
      <button
        onClick={() => onSelect(selected ? null : document.id)}
        className="flex min-w-0 flex-1 items-center gap-2 py-0.5 text-left text-sm"
      >
        <FileText className="size-4 shrink-0 text-muted-foreground" />
        <Tooltip>
          <TooltipTrigger
            render={
              <span className="min-w-0 flex-1 truncate">{document.name}</span>
            }
          />
          <TooltipContent>{document.name}</TooltipContent>
        </Tooltip>
        {status && (
          <span className="shrink-0 text-xs text-muted-foreground">
            {getDocumentStatusLabel(status)}
          </span>
        )}
      </button>
      {document.fileUrl && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Preview ${document.name}`}
          title="Preview document"
          onClick={() => onPreview(document)}
        >
          <Eye className="size-4" />
        </Button>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Actions for ${document.name}`}
              title="Document actions"
              disabled={isDeleting}
            />
          }
        >
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-44 min-w-44"
        >
          <DropdownMenuItem variant="destructive" onClick={onDelete}>
            <Trash2 className="size-4" />
            <span className="whitespace-nowrap">Delete document</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function DocumentPreviewDialogWrapper({
  document,
  onClose,
}: {
  document: DocumentItem;
  onClose: () => void;
}) {
  return (
    <DocumentPreviewDialog
      name={document.name}
      fileUrl={document.fileUrl!}
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    />
  );
}

function getDocumentStatusLabel(status: string): string {
  switch (status.toLowerCase()) {
    case "uploaded":
    case "pending":
    case "processing":
      return "Processing";
    case "processed":
    case "completed":
      return "Processed";
    default:
      return status;
  }
}
