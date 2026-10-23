"use client";

import { ExternalLink, FileText, Image as ImageIcon } from "lucide-react";
import type { Citation } from "../services/chat-service";
import { MarkdownRenderer } from "./markdown-renderer";

type ChatCitationsProps = {
  citations?: Citation[];
};

export function ChatCitations({ citations }: ChatCitationsProps) {
  if (!citations?.length) return null;

  return (
    <div className="ml-1 inline-flex flex-wrap items-center gap-1 align-middle">
      {citations.map((citation, index) => {
        const isImage =
          citation.modality === "image" || Boolean(citation.image_url);

        const sourceUrl = isImage
          ? citation.image_url || citation.file_url
          : citation.file_url;

        return (
          <div
            key={citation.segment_id || `${citation.page}-${index}`}
            className="group relative inline-flex align-middle"
          >
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Source ${index + 1}: ${citation.filename}, page ${citation.page}`}
              className="inline-flex size-5 items-center justify-center rounded-full border border-border bg-muted/70 text-[10px] font-semibold leading-none text-muted-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
            >
              {index + 1}
            </a>

            {/* Hover source preview */}
            <div className="pointer-events-none invisible absolute bottom-full left-1/2 z-50 mb-2 w-72 -translate-x-1/2 translate-y-1 opacity-0 transition-all duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
              <div className="pointer-events-auto block overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-xl">
                {isImage && citation.image_url ? (
                  <div className="block h-32 overflow-hidden border-b bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={citation.image_url}
                      alt={`Preview from ${citation.filename}`}
                      className="size-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 border-b bg-muted/40 px-3 py-2.5">
                    <FileText className="size-5 shrink-0 text-primary" />
                    <span className="min-w-0 flex-1 truncate text-xs font-medium">
                      {citation.filename}
                    </span>
                    {isImage && (
                      <ImageIcon className="size-4 shrink-0 text-muted-foreground" />
                    )}
                  </div>
                )}

                <div className="p-3">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-semibold">
                      {citation.filename}
                    </span>
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      Page {citation.page}
                    </span>
                  </div>

                  <div className="max-h-32 overflow-y-auto text-xs leading-5 text-muted-foreground">
                    <MarkdownRenderer content={citation.content} />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                    {isImage && citation.image_url && (
                      <a
                        href={citation.image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        Open image
                        <ExternalLink className="size-3" />
                      </a>
                    )}
                    <a
                      href={citation.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      Open PDF
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
