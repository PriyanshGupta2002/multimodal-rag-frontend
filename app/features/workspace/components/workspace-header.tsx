"use client";

import { FileText, PanelLeft, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

type WorkspaceHeaderProps = {
  title: string;
  selectedDocumentName?: string;
  onToggleSidebar: () => void;
  onUpload: () => void;
};

export function WorkspaceHeader({
  title,
  selectedDocumentName,
  onToggleSidebar,
  onUpload,
}: WorkspaceHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <PanelLeft className="size-4" />
        </Button>

        <h1 className="truncate text-sm font-semibold">{title}</h1>
      </div>

      <div className="flex min-w-0 items-center gap-2">
        {selectedDocumentName && (
          <div
            className="flex min-w-0 max-w-[min(45vw,20rem)] items-center gap-2 rounded-full border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground"
            title={`Using document: ${selectedDocumentName}`}
          >
            <FileText className="size-3.5 shrink-0" />
            <span className="truncate">{selectedDocumentName}</span>
          </div>
        )}

        <Button variant="outline" size="sm" onClick={onUpload}>
          <Upload className="mr-2 size-4" />
          <span className="hidden sm:inline">Upload files</span>
        </Button>
      </div>
    </header>
  );
}
