export type UploadedDocument = {
  id: string;
  filename: string;
  file_url?: string;
  status?:
    | "uploaded"
    | "pending"
    | "processing"
    | "processed"
    | "completed"
    | "failed";
};

export type UploadDocumentResponse = {
  id?: string;
  filename?: string;
  message?: string;
  status?: string;
  document?: UploadedDocument;
};

export type DocumentsResponse = {
  documents: UploadedDocument[];
  total: number;
};

export type DocumentStatusResponse = {
  status: string;
};
