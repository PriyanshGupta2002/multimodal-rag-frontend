import { api } from "@/lib/axios";

export interface Thread {
  id: string;
  title: string;
}

export interface TokenUsage {
  input_tokens?: number;
  output_tokens?: number;
  total_tokens?: number;
  input_token_details?: {
    cache_read?: number;
    cache_creation?: number;
  };
  output_token_details?: {
    reasoning?: number;
  };
}

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface Citation {
  page: number;
  content: string;
  file_url: string;
  filename: string;
  modality: string;
  image_url: string | null;
  segment_id: string;
}

export interface ChatMessage {
  id: string;
  thread_id: string;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
  metadata?: {
    citations?: Citation[];
    usage?: TokenUsage;
  };
}

export async function createThread(title: string) {
  const response = await api.post<ApiEnvelope<Thread>>("/threads/create", {
    title,
  });

  return response.data.data;
}

export async function updateThread(threadId: string, title: string) {
  const response = await api.patch<ApiEnvelope<Thread>>(
    `/threads/${encodeURIComponent(threadId)}`,
    { title },
  );

  return response.data.data;
}

export async function deleteThread(threadId: string) {
  await api.delete(`/threads/${encodeURIComponent(threadId)}`);
}

export async function getThreads() {
  const response = await api.get<ApiEnvelope<Thread[]>>("/threads", {
    params: { limit: 100, offset: 0 },
  });

  return response.data.data;
}

export async function getThreadMessages(threadId: string) {
  const response = await api.get<ApiEnvelope<ChatMessage[]>>(
    `/chat/${threadId}/messages`,
  );

  return response.data.data;
}
