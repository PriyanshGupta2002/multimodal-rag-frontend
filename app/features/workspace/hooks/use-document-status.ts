import { useQuery, type Query } from "@tanstack/react-query";
import { getDocumentStatus } from "../services/document.service";
import type { DocumentStatusResponse } from "../types/document.types";

const DOCUMENT_STATUS_POLL_INTERVAL = 60_000;

function isUploaded(status: string | undefined): boolean {
  return status?.toLowerCase() === "uploaded";
}

export function useDocumentStatus(documentId: string, initialStatus?: string) {
  return useQuery({
    queryKey: ["documents", "status", documentId],
    queryFn: () => getDocumentStatus(documentId),
    enabled: isUploaded(initialStatus),
    refetchInterval: (query: Query<DocumentStatusResponse>) =>
      isUploaded(query.state.data?.status ?? initialStatus)
        ? DOCUMENT_STATUS_POLL_INTERVAL
        : false,
  });
}
