import type { ChatMessage } from "./chat-service";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface StreamCallbacks {
  onToken: (token: string) => void;
  onCitations?: (items: unknown[]) => void;
  onDone?: () => void;
  signal?: AbortSignal;
}

export async function streamChat(
  payload: {
    thread_id: string;
    message: string;
    document_id: string | null;
  },
  callbacks: StreamCallbacks,
) {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }

  const response = await fetch(`${API_URL.replace(/\/$/, "")}/chat/stream`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify(payload),
    signal: callbacks.signal,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Chat failed (${response.status})`);
  }

  if (!response.body) {
    throw new Error("The server did not return a stream.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let eventName = "message";
  let dataLines: string[] = [];

  function dispatchEvent() {
    if (!dataLines.length) {
      eventName = "message";
      return;
    }

    const raw = dataLines.join("\n");
    dataLines = [];

    let data: Record<string, unknown>;

    try {
      data = JSON.parse(raw);
    } catch {
      throw new Error("Received an invalid SSE event from the server.");
    }

    switch (eventName) {
      case "token":
        if (typeof data.content === "string") {
          callbacks.onToken(data.content);
        }
        break;

      case "citations":
        if (Array.isArray(data.items)) {
          callbacks.onCitations?.(data.items);
        }
        break;

      case "error":
        throw new Error(
          typeof data.message === "string"
            ? data.message
            : "Response generation failed.",
        );

      case "done":
        callbacks.onDone?.();
        break;
    }

    eventName = "message";
  }

  try {
    while (true) {
      const { value, done } = await reader.read();

      buffer += decoder.decode(value, { stream: !done });

      const blocks = buffer.split(/\r?\n\r?\n/);
      buffer = blocks.pop() ?? "";

      for (const block of blocks) {
        for (const line of block.split(/\r?\n/)) {
          if (line.startsWith("event:")) {
            eventName = line.slice(6).trim();
          } else if (line.startsWith("data:")) {
            dataLines.push(line.slice(5).trimStart());
          }
        }

        dispatchEvent();
      }

      if (done) break;
    }

    if (buffer.trim()) {
      for (const line of buffer.split(/\r?\n/)) {
        if (line.startsWith("event:")) {
          eventName = line.slice(6).trim();
        } else if (line.startsWith("data:")) {
          dataLines.push(line.slice(5).trimStart());
        }
      }
      dispatchEvent();
    }
  } finally {
    reader.releaseLock();
  }
}
