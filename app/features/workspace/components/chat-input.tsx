"use client";

import { useState } from "react";
import { FileText, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DocumentPreviewDialog } from "./document-preview-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ChatInputProps = {
  disabled?: boolean;
  selectedDocument?: {
    name: string;
    fileUrl?: string;
  };
  onSend: (message: string) => void;
};

export function ChatInput({
  disabled = false,
  selectedDocument,
  onSend,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const selectedDocumentName = selectedDocument?.name;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const value = message.trim();
    if (!value || disabled) return;

    onSend(value);
    setMessage("");
  }

  return (
    <div className="w-full border-t bg-background px-4 py-4 sm:px-6">
      <form
        onSubmit={submit}
        className="mx-auto max-w-3xl rounded-2xl border bg-background p-3 shadow-sm transition-colors focus-within:border-primary/40"
      >
        {selectedDocument && (
          <div className="mb-2">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={!selectedDocument.fileUrl}
                    onClick={() => setPreviewOpen(true)}
                    className="max-w-full justify-start gap-2"
                    aria-label={`Preview selected document ${selectedDocument.name}`}
                  />
                }
              >
                <FileText className="size-3.5 shrink-0" />
                <span className="max-w-56 truncate">
                  {selectedDocument.name}
                </span>
              </TooltipTrigger>
              <TooltipContent>{selectedDocument.name}</TooltipContent>
            </Tooltip>
          </div>
        )}

        <Textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
          placeholder={
            selectedDocumentName
              ? `Ask anything about ${selectedDocumentName}...`
              : "Ask anything... (document selection is optional)"
          }
          aria-label="Chat message"
          rows={2}
          className="max-h-40 resize-none border-0 shadow-none focus-visible:ring-0"
          disabled={disabled}
        />

        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="min-w-0 truncate text-xs text-muted-foreground">
            {selectedDocumentName ? (
              <>Using document: {selectedDocumentName}</>
            ) : (
              "Search across your available documents"
            )}
          </span>

          <Button
            type="submit"
            size="sm"
            disabled={disabled || !message.trim()}
          >
            <Send className="mr-2 size-4" />
            Send
          </Button>
        </div>
      </form>

      <p className="mx-auto mt-2 max-w-3xl text-center text-xs text-muted-foreground">
        AI responses may contain mistakes. Verify important information.
      </p>
      {selectedDocument?.fileUrl && (
        <DocumentPreviewDialog
          name={selectedDocument.name}
          fileUrl={selectedDocument.fileUrl}
          open={previewOpen}
          onOpenChange={setPreviewOpen}
        />
      )}
    </div>
  );
}
