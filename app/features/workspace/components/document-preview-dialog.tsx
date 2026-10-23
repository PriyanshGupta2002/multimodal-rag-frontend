"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type DocumentPreviewDialogProps = {
  name: string;
  fileUrl: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DocumentPreviewDialog({
  name,
  fileUrl,
  open,
  onOpenChange,
}: DocumentPreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[85dvh] w-[95vw] max-w-5xl flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl">
        <DialogHeader className="border-b px-4 py-3">
          <DialogTitle className="truncate text-sm">{name}</DialogTitle>
        </DialogHeader>
        <iframe
          src={fileUrl}
          title={`Preview of ${name}`}
          className="min-h-0 flex-1 bg-muted"
        />
      </DialogContent>
    </Dialog>
  );
}
