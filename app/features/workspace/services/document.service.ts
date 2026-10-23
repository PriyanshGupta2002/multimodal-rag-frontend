import { api } from "@/lib/axios";
import type {
  DocumentsResponse,
  DocumentStatusResponse,
  UploadDocumentResponse,
} from "../types/document.types";

export async function getDocuments(): Promise<DocumentsResponse> {
  const { data } = await api.get<DocumentsResponse>("/documents");

  return data;
}

export async function deleteDocument(documentId: string): Promise<void> {
  await api.delete(
    `/documents/delete/${encodeURIComponent(documentId)}`,
  );
}

export async function uploadDocument(
  file: File,
): Promise<UploadDocumentResponse> {
  const formData = new FormData();

  // Assumes FastAPI declares UploadFile = File(...).
  // The form field name must match the backend parameter.
  formData.append("file", file);

  const { data } = await api.post<UploadDocumentResponse>(
    "/documents/upload",
    formData,
  );

  return data;
}

export async function getDocumentStatus(
  documentId: string,
): Promise<DocumentStatusResponse> {
  const { data } = await api.get<DocumentStatusResponse>(
    `/documents/status/${encodeURIComponent(documentId)}`,
  );

  return data;
}
